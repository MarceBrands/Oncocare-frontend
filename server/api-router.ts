import type { IncomingMessage, ServerResponse } from 'node:http';
import type { ApiRepository } from './repository';

type RouteParams = {
  segments: string[];
  searchParams: URLSearchParams;
};

export function sendJson(res: ServerResponse, statusCode: number, body: unknown) {
  res.statusCode = statusCode;

  if (statusCode === 204) {
    res.end();
    return;
  }

  res.setHeader('content-type', 'application/json');
  res.end(JSON.stringify(body));
}

async function readBody(req: IncomingMessage) {
  return new Promise<string>((resolve, reject) => {
    let body = '';

    req.on('data', (chunk) => {
      body += chunk;
    });

    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

async function readJson(req: IncomingMessage) {
  const body = await readBody(req);
  return body ? JSON.parse(body) : null;
}

function getId(segments: string[], index: number) {
  return segments[index] && segments[index] !== '' ? segments[index] : null;
}

async function handlePatients(
  repo: ApiRepository,
  req: IncomingMessage,
  res: ServerResponse,
  { segments }: RouteParams
) {
  const id = getId(segments, 1);

  if (!id && req.method === 'GET') {
    sendJson(res, 200, await repo.listPatients());
    return true;
  }

  if (!id && req.method === 'POST') {
    sendJson(res, 201, await repo.createPatient(await readJson(req)));
    return true;
  }

  if (id && segments[2] === 'perfil' && req.method === 'GET') {
    const profile = await repo.getPatientProfile(id);
    sendJson(res, profile ? 200 : 404, profile ?? { error: 'Paciente nao encontrada.' });
    return true;
  }

  if (id && req.method === 'GET') {
    const patient = await repo.getPatient(id);
    sendJson(res, patient ? 200 : 404, patient ?? { error: 'Paciente nao encontrada.' });
    return true;
  }

  if (id && req.method === 'PUT') {
    const patient = await repo.updatePatient(id, await readJson(req));
    sendJson(res, patient ? 200 : 404, patient ?? { error: 'Paciente nao encontrada.' });
    return true;
  }

  if (id && req.method === 'DELETE') {
    const deleted = await repo.deletePatient(id);
    sendJson(res, deleted ? 204 : 404, deleted ? null : { error: 'Paciente nao encontrada.' });
    return true;
  }

  return false;
}

async function handleTreatments(
  repo: ApiRepository,
  req: IncomingMessage,
  res: ServerResponse,
  { segments, searchParams }: RouteParams
) {
  const id = getId(segments, 1);

  if (!id && req.method === 'GET') {
    sendJson(res, 200, await repo.listTreatments(searchParams.get('patientId')));
    return true;
  }

  if (!id && req.method === 'POST') {
    sendJson(res, 201, await repo.createTreatment(await readJson(req)));
    return true;
  }

  if (id && req.method === 'PUT') {
    const treatment = await repo.updateTreatment(id, await readJson(req));
    sendJson(res, treatment ? 200 : 404, treatment ?? { error: 'Tratamento nao encontrado.' });
    return true;
  }

  if (id && req.method === 'DELETE') {
    const deleted = await repo.deleteTreatment(id);
    sendJson(res, deleted ? 204 : 404, deleted ? null : { error: 'Tratamento nao encontrado.' });
    return true;
  }

  return false;
}

async function handleExams(
  repo: ApiRepository,
  req: IncomingMessage,
  res: ServerResponse,
  { segments, searchParams }: RouteParams
) {
  if (segments.length === 1 && req.method === 'GET') {
    sendJson(res, 200, await repo.getExamsOverview(searchParams.get('patientId')));
    return true;
  }

  if (segments[1] === 'resultados' && !segments[2] && req.method === 'POST') {
    sendJson(res, 201, await repo.createExamResult(await readJson(req)));
    return true;
  }

  if (segments[1] === 'resultados' && segments[2] && req.method === 'PUT') {
    const result = await repo.updateExamResult(segments[2], await readJson(req));
    sendJson(res, result ? 200 : 404, result ?? { error: 'Exame nao encontrado.' });
    return true;
  }

  if (segments[1] === 'resultados' && segments[2] && req.method === 'DELETE') {
    const deleted = await repo.deleteExamResult(segments[2]);
    sendJson(res, deleted ? 204 : 404, deleted ? null : { error: 'Exame nao encontrado.' });
    return true;
  }

  return false;
}

async function handleSymptoms(
  repo: ApiRepository,
  req: IncomingMessage,
  res: ServerResponse,
  { segments, searchParams }: RouteParams
) {
  if (segments.length === 1 && req.method === 'GET') {
    sendJson(res, 200, await repo.getSymptomsOverview(searchParams.get('patientId')));
    return true;
  }

  if (segments[1] === 'avaliacoes' && !segments[2] && req.method === 'POST') {
    sendJson(res, 201, await repo.createSymptomAssessment(await readJson(req)));
    return true;
  }

  if (segments[1] === 'avaliacoes' && segments[2] && req.method === 'PUT') {
    const assessment = await repo.updateSymptomAssessment(segments[2], await readJson(req));
    sendJson(
      res,
      assessment ? 200 : 404,
      assessment ?? { error: 'Avaliacao nao encontrada.' }
    );
    return true;
  }

  if (segments[1] === 'avaliacoes' && segments[2] && req.method === 'DELETE') {
    const deleted = await repo.deleteSymptomAssessment(segments[2]);
    sendJson(res, deleted ? 204 : 404, deleted ? null : { error: 'Avaliacao nao encontrada.' });
    return true;
  }

  return false;
}

async function handleBioimpedance(
  repo: ApiRepository,
  req: IncomingMessage,
  res: ServerResponse,
  { segments, searchParams }: RouteParams
) {
  if (segments.length === 1 && req.method === 'GET') {
    sendJson(res, 200, await repo.getBioimpedanceOverview(searchParams.get('patientId')));
    return true;
  }

  if (segments[1] === 'avaliacoes' && !segments[2] && req.method === 'POST') {
    sendJson(res, 201, await repo.createBioimpedanceAssessment(await readJson(req)));
    return true;
  }

  if (segments[1] === 'avaliacoes' && segments[2] && req.method === 'PUT') {
    const assessment = await repo.updateBioimpedanceAssessment(segments[2], await readJson(req));
    sendJson(
      res,
      assessment ? 200 : 404,
      assessment ?? { error: 'Avaliacao nao encontrada.' }
    );
    return true;
  }

  if (segments[1] === 'avaliacoes' && segments[2] && req.method === 'DELETE') {
    const deleted = await repo.deleteBioimpedanceAssessment(segments[2]);
    sendJson(res, deleted ? 204 : 404, deleted ? null : { error: 'Avaliacao nao encontrada.' });
    return true;
  }

  return false;
}

async function handleAlerts(
  repo: ApiRepository,
  req: IncomingMessage,
  res: ServerResponse,
  { segments, searchParams }: RouteParams
) {
  const id = getId(segments, 1);

  if (!id && req.method === 'GET') {
    sendJson(res, 200, await repo.listAlerts(searchParams.get('patientId')));
    return true;
  }

  if (!id && req.method === 'POST') {
    sendJson(res, 201, await repo.createAlert(await readJson(req)));
    return true;
  }

  if (id && req.method === 'PUT') {
    const alert = await repo.updateAlert(id, await readJson(req));
    sendJson(res, alert ? 200 : 404, alert ?? { error: 'Alerta nao encontrado.' });
    return true;
  }

  if (id && req.method === 'DELETE') {
    const deleted = await repo.deleteAlert(id);
    sendJson(res, deleted ? 204 : 404, deleted ? null : { error: 'Alerta nao encontrado.' });
    return true;
  }

  return false;
}

async function handleTimeline(
  repo: ApiRepository,
  req: IncomingMessage,
  res: ServerResponse,
  { segments, searchParams }: RouteParams
) {
  const id = getId(segments, 1);

  if (!id && req.method === 'GET') {
    sendJson(res, 200, await repo.listTimeline(searchParams.get('patientId')));
    return true;
  }

  if (!id && req.method === 'POST') {
    sendJson(res, 201, await repo.createTimelineEvent(await readJson(req)));
    return true;
  }

  if (id && req.method === 'PUT') {
    const event = await repo.updateTimelineEvent(id, await readJson(req));
    sendJson(res, event ? 200 : 404, event ?? { error: 'Evento nao encontrado.' });
    return true;
  }

  if (id && req.method === 'DELETE') {
    const deleted = await repo.deleteTimelineEvent(id);
    sendJson(res, deleted ? 204 : 404, deleted ? null : { error: 'Evento nao encontrado.' });
    return true;
  }

  return false;
}

export async function handleApiRequest(
  repo: ApiRepository,
  req: IncomingMessage,
  res: ServerResponse
) {
  try {
    const url = new URL(req.url ?? '/', 'http://localhost');
    const segments = url.pathname.replace(/^\/api\/?/, '').split('/').filter(Boolean);
    const routeParams = { segments, searchParams: url.searchParams };
    const resource = segments[0];

    if (resource === 'dashboard' && req.method === 'GET') {
      sendJson(res, 200, await repo.getDashboard());
      return;
    }

    if (resource === 'configuracoes') {
      if (req.method === 'GET') {
        sendJson(res, 200, await repo.getSettings());
        return;
      }

      if (req.method === 'PUT') {
        sendJson(res, 200, await repo.updateSettings(await readJson(req)));
        return;
      }
    }

    const handled =
      (resource === 'pacientes' && (await handlePatients(repo, req, res, routeParams))) ||
      (resource === 'tratamentos' && (await handleTreatments(repo, req, res, routeParams))) ||
      (resource === 'exames' && (await handleExams(repo, req, res, routeParams))) ||
      (resource === 'sintomas' && (await handleSymptoms(repo, req, res, routeParams))) ||
      (resource === 'bioimpedancia' &&
        (await handleBioimpedance(repo, req, res, routeParams))) ||
      (resource === 'alertas' && (await handleAlerts(repo, req, res, routeParams))) ||
      (resource === 'timeline' && (await handleTimeline(repo, req, res, routeParams)));

    if (!handled) {
      sendJson(res, 404, { error: 'Endpoint nao encontrado.' });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro inesperado.';
    sendJson(res, 500, { error: message });
  }
}
