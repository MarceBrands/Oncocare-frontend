import { useEffect, useMemo, useState } from 'react';
import { Outlet, Link } from 'react-router';
import { Plus, Search, MapPin, CalendarDays, ShieldCheck } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { supabase, type PacienteRow } from '../../lib/supabase';

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

export function Pacientes() {
  const [patients, setPatients] = useState<PacienteRow[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPatients() {
      setLoading(true);
      setError(null);

      const { data, error: supabaseError } = await supabase
        .from('pacientes')
        .select('*')
        .order('created_at', { ascending: false });

      if (supabaseError) {
        setError(supabaseError.message);
        setPatients([]);
      } else {
        setPatients((data ?? []) as PacienteRow[]);
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
        patient.id.toLowerCase().includes(term)
      );
    });
  }, [patients, search]);

  return (
    <>
      <div className="mb-8">
        <div className="flex flex-col gap-4 mb-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-950">Pacientes</h1>
            <p className="text-slate-600 mt-2 max-w-2xl">
              Acompanhe risco, pendencias e continuidade do cuidado em servicos publicos, clinicas privadas e atendimentos particulares.
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
          <div className="flex flex-col gap-4 xl:flex-row">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-5 text-slate-400" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por nome, CPF ou id..."
                className="pl-10 rounded-lg border-slate-200"
              />
            </div>
            <Select disabled>
              <SelectTrigger className="w-full xl:w-52 rounded-lg">
                <SelectValue placeholder="Tipo de cancer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
              </SelectContent>
            </Select>
            <Select disabled>
              <SelectTrigger className="w-full xl:w-48 rounded-lg">
                <SelectValue placeholder="Risco" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
              </SelectContent>
            </Select>
            <Select disabled>
              <SelectTrigger className="w-full xl:w-56 rounded-lg">
                <SelectValue placeholder="Linha do cuidado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>
      </div>

      {loading && (
        <Card className="p-8 bg-white border border-slate-200 shadow-sm rounded-lg">
          <p className="text-slate-600">Carregando pacientes...</p>
        </Card>
      )}

      {!loading && error && (
        <Card className="p-8 bg-red-50 border border-red-200 shadow-sm rounded-lg">
          <p className="font-semibold text-red-900">Nao consegui buscar pacientes no Supabase.</p>
          <p className="text-sm text-red-800 mt-2">{error}</p>
        </Card>
      )}

      {!loading && !error && filteredPatients.length === 0 && (
        <Card className="p-8 bg-white border border-slate-200 shadow-sm rounded-lg">
          <p className="font-semibold text-slate-950">Nenhuma paciente cadastrada ainda.</p>
          <p className="text-sm text-slate-600 mt-2">
            Clique em Nova paciente para gravar o primeiro cadastro direto no Supabase.
          </p>
        </Card>
      )}

      {!loading && !error && filteredPatients.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredPatients.map((patient) => (
            <Link key={patient.id} to={`/pacientes/${patient.id}`}>
              <Card className="p-5 bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 rounded-lg h-full">
                <div className="flex items-start gap-4 mb-4">
                  <div className="size-14 rounded-lg flex items-center justify-center font-bold text-white text-base bg-cyan-700">
                    {patient.nome.split(' ')[0]?.[0] ?? 'P'}
                    {patient.nome.split(' ')[1]?.[0] ?? ''}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-950 truncate">{patient.nome}</h3>
                    <p className="text-sm text-slate-500">
                      {getAge(patient.data_nascimento)} anos
                    </p>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                      <ShieldCheck className="size-3" /> CPF protegido: {maskCpf(patient.cpf)}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-slate-500 mb-2">Diagnostico</p>
                    <Badge variant="secondary" className="bg-slate-100 text-slate-700">
                      A vincular
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
                    <div>
                      <p className="text-xs text-slate-500">Atendimento</p>
                      <p className="text-lg font-bold text-slate-950">{patient.tipo_atendimento}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500">Status</p>
                      <Badge variant="secondary">Cadastrada</Badge>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs text-slate-600 pt-3 border-t border-slate-100">
                    <p className="flex items-center gap-2">
                      <MapPin className="size-4 text-slate-400" /> {patient.tipo_atendimento}
                    </p>
                    <p className="flex items-center gap-2">
                      <CalendarDays className="size-4 text-slate-400" />
                      Cadastro:{' '}
                      {patient.created_at
                        ? new Date(patient.created_at).toLocaleDateString('pt-BR')
                        : 'sem data'}
                    </p>
                    <p className="font-medium text-slate-800">
                      Linha do cuidado: aguardando dados clinicos
                    </p>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <Outlet />
    </>
  );
}
