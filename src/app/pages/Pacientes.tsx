import { useEffect, useMemo, useState } from 'react';
import { Outlet, Link } from 'react-router';
import { Plus, Search, ShieldCheck } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../components/ui/accordion';
import { listPatients, type PacienteRow } from '../../lib/api';

function maskCpf(cpf: string) {
  const onlyNumbers = cpf.replace(/\D/g, '');

  if (onlyNumbers.length !== 11) {
    return cpf;
  }

  return `${onlyNumbers.slice(0, 3)}.***.***-${onlyNumbers.slice(9)}`;
}

function getAge(birthDate: string) {
  const birth = new Date(`${birthDate}T00:00:00`);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }

  return age;
}

function formatDate(date: string | null) {
  return date ? new Date(date).toLocaleDateString('pt-BR') : 'sem data';
}

export function Pacientes() {
  const [patients, setPatients] = useState<PacienteRow[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPatients() {
      setLoading(true);
      setError(null);

      try {
        const data = await listPatients();
        setPatients(data);
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Erro inesperado.');
        setPatients([]);
      }

      setLoading(false);
    }

    loadPatients();
  }, []);

  const filteredPatients = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) {
      return patients;
    }

    return patients.filter((patient) => {
      return (
        patient.nome.toLowerCase().includes(term) ||
        patient.cpf.toLowerCase().includes(term) ||
        patient.id.toLowerCase().includes(term) ||
        patient.tipo_atendimento.toLowerCase().includes(term)
      );
    });
  }, [patients, search]);

  return (
    <>
      <div className="mb-6">
        <div className="flex flex-col gap-4 mb-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-950">Pacientes</h1>
            <p className="text-slate-600 mt-2 max-w-2xl">
              Lista operacional de pacientes, com cadastro, atendimento e dados clinicos principais em cada linha.
            </p>
          </div>
          <Link to="/pacientes/novo">
            <Button className="bg-cyan-700 hover:bg-cyan-800 shadow-sm">
              <Plus className="size-5 mr-2" />
              Nova paciente
            </Button>
          </Link>
        </div>

        <Card className="p-4 bg-white border border-slate-200 shadow-sm rounded-lg">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por nome, CPF, tipo de atendimento ou id..."
              className="pl-10 rounded-lg border-slate-200"
            />
          </div>
        </Card>
      </div>

      {loading && (
        <Card className="p-6 bg-white border border-slate-200 shadow-sm rounded-lg">
          <p className="text-slate-600">Carregando pacientes...</p>
        </Card>
      )}

      {!loading && error && (
        <Card className="p-6 bg-red-50 border border-red-200 shadow-sm rounded-lg">
          <p className="font-semibold text-red-900">Nao consegui buscar pacientes.</p>
          <p className="text-sm text-red-800 mt-2">{error}</p>
        </Card>
      )}

      {!loading && !error && filteredPatients.length === 0 && (
        <Card className="p-6 bg-white border border-slate-200 shadow-sm rounded-lg">
          <p className="font-semibold text-slate-950">Nenhuma paciente encontrada.</p>
          <p className="text-sm text-slate-600 mt-2">
            Cadastre uma paciente ou refine a busca.
          </p>
        </Card>
      )}

      {!loading && !error && filteredPatients.length > 0 && (
        <Card className="bg-white border border-slate-200 shadow-sm rounded-lg overflow-hidden">
          <div className="hidden md:grid grid-cols-[minmax(0,1.4fr)_8rem_10rem_10rem] gap-4 border-b border-slate-200 bg-slate-50 px-5 py-3 text-xs font-semibold uppercase tracking-normal text-slate-500">
            <span>Paciente</span>
            <span>Idade</span>
            <span>Atendimento</span>
            <span>Cadastro</span>
          </div>

          <Accordion type="single" collapsible>
            {filteredPatients.map((patient) => (
              <AccordionItem key={patient.id} value={patient.id} className="border-slate-200 px-5">
                <AccordionTrigger className="hover:no-underline">
                  <div className="grid w-full grid-cols-1 gap-2 pr-4 text-left md:grid-cols-[minmax(0,1.4fr)_8rem_10rem_10rem] md:items-center md:gap-4">
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-slate-950">{patient.nome}</p>
                      <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                        <ShieldCheck className="size-3" />
                        CPF protegido: {maskCpf(patient.cpf)}
                      </p>
                    </div>
                    <span className="text-sm text-slate-700">{getAge(patient.data_nascimento)} anos</span>
                    <Badge variant="secondary" className="w-fit bg-slate-100 text-slate-700">
                      {patient.tipo_atendimento}
                    </Badge>
                    <span className="text-sm text-slate-600">{formatDate(patient.created_at)}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="grid gap-4 rounded-lg bg-slate-50 p-4 md:grid-cols-2 lg:grid-cols-3">
                    <InfoBlock label="Diagnostico" value="A vincular" />
                    <InfoBlock label="Tipo de atendimento" value={patient.tipo_atendimento} />
                    <InfoBlock label="Data de nascimento" value={formatDate(patient.data_nascimento)} />
                    <InfoBlock label="Medico vinculado" value={patient.medico_id ?? 'Nao informado'} />
                    <InfoBlock label="Ultima atualizacao" value={formatDate(patient.updated_at)} />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Link to={`/pacientes/${patient.id}`}>
                      <Button variant="outline" size="sm">
                        Abrir perfil
                      </Button>
                    </Link>
                    <Link to="/sintomas">
                      <Button size="sm" className="bg-cyan-700 hover:bg-cyan-800">
                        Registrar avaliacao
                      </Button>
                    </Link>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Card>
      )}

      <Outlet />
    </>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 break-words text-sm font-medium text-slate-900">{value}</p>
    </div>
  );
}
