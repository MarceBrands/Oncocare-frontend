import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Plugin } from 'vite';
import { getPool } from './database';

type CreatePatientRequest = {
  nome: string;
  cpf: string;
  data_nascimento: string;
  tipo_atendimento: string;
  diagnosticos?: Array<'mama' | 'colo_utero'>;
  observacoes?: string | null;
};

function sendJson(res: ServerResponse, statusCode: number, body: unknown) {
  res.statusCode = statusCode;
  res.setHeader('content-type', 'application/json');
  res.end(JSON.stringify(body));
}

function readBody(req: IncomingMessage) {
  return new Promise<string>((resolve, reject) => {
    let body = '';

    req.on('data', (chunk) => {
      body += chunk;
    });

    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

function isValidDiagnosis(value: string): value is 'mama' | 'colo_utero' {
  return value === 'mama' || value === 'colo_utero';
}

function normalizeCreatePatientRequest(body: unknown): CreatePatientRequest | null {
  if (!body || typeof body !== 'object') {
    return null;
  }

  const payload = body as Record<string, unknown>;
  const nome = typeof payload.nome === 'string' ? payload.nome.trim() : '';
  const cpf = typeof payload.cpf === 'string' ? payload.cpf.trim() : '';
  const dataNascimento =
    typeof payload.data_nascimento === 'string' ? payload.data_nascimento : '';
  const tipoAtendimento =
    typeof payload.tipo_atendimento === 'string' ? payload.tipo_atendimento.trim() : '';
  const observacoes =
    typeof payload.observacoes === 'string' && payload.observacoes.trim()
      ? payload.observacoes.trim()
      : null;
  const diagnosticos = Array.isArray(payload.diagnosticos)
    ? payload.diagnosticos.filter(
        (diagnostico): diagnostico is 'mama' | 'colo_utero' =>
          typeof diagnostico === 'string' && isValidDiagnosis(diagnostico)
      )
    : [];

  if (!nome || !cpf || !dataNascimento || !tipoAtendimento) {
    return null;
  }

  return {
    nome,
    cpf,
    data_nascimento: dataNascimento,
    tipo_atendimento: tipoAtendimento,
    diagnosticos,
    observacoes,
  };
}

async function listPatients(res: ServerResponse) {
  const { rows } = await getPool().query(`
    select
      id,
      nome,
      data_nascimento,
      cpf,
      medico_id,
      created_at,
      usuario_perfil_id,
      cadastrado_por_medico_id,
      updated_at,
      tipo_atendimento,
      tipo_atendimento_id
    from pacientes
    order by created_at desc
  `);

  sendJson(res, 200, rows);
}

async function createPatient(req: IncomingMessage, res: ServerResponse) {
  const rawBody = await readBody(req);
  const body = rawBody ? JSON.parse(rawBody) : null;
  const patient = normalizeCreatePatientRequest(body);

  if (!patient) {
    sendJson(res, 400, { error: 'Dados obrigatorios da paciente estao incompletos.' });
    return;
  }

  const pool = getPool();
  const client = await pool.connect();

  try {
    await client.query('begin');

    const patientResult = await client.query<{ id: string }>(
      `
        insert into pacientes (
          nome,
          cpf,
          data_nascimento,
          tipo_atendimento,
          tipo_atendimento_id
        )
        values ($1, $2, $3, $4, (
          select id
          from tipo_atendimentos
          where nome = $4
        ))
        returning id
      `,
      [patient.nome, patient.cpf, patient.data_nascimento, patient.tipo_atendimento]
    );

    const patientId = patientResult.rows[0]?.id;

    if (!patientId) {
      throw new Error('Paciente criada sem id retornado.');
    }

    for (const tipoCancer of patient.diagnosticos ?? []) {
      await client.query(
        `
          insert into paciente_diagnosticos (paciente_id, tipo_cancer, observacoes)
          values ($1, $2, $3)
        `,
        [patientId, tipoCancer, patient.observacoes ?? null]
      );
    }

    await client.query('commit');
    sendJson(res, 201, { id: patientId });
  } catch (error) {
    await client.query('rollback');
    throw error;
  } finally {
    client.release();
  }
}

async function handleApiRequest(req: IncomingMessage, res: ServerResponse) {
  try {
    const url = new URL(req.url ?? '/', 'http://localhost');

    if (url.pathname === '/api/pacientes' && req.method === 'GET') {
      await listPatients(res);
      return;
    }

    if (url.pathname === '/api/pacientes' && req.method === 'POST') {
      await createPatient(req, res);
      return;
    }

    sendJson(res, 404, { error: 'Endpoint nao encontrado.' });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro inesperado.';
    sendJson(res, 500, { error: message });
  }
}

export function devApiPlugin(): Plugin {
  return {
    name: 'oncocare-dev-api',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url?.startsWith('/api/')) {
          next();
          return;
        }

        void handleApiRequest(req, res);
      });
    },
  };
}
