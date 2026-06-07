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

const patients = [
  {
    id: 1,
    code: 'PAC-0001',
    name: 'Maria Santos Silva',
    cpf: '123.456.789-00',
    age: 48,
    diagnosis: ['Câncer de Mama'],
    status: 'critical',
    lineStatus: 'Retorno hoje',
    unit: 'UBS Vila Esperança',
    lastVisit: '2026-05-30',
    riskScore: 8.5,
  },
  {
    id: 2,
    code: 'PAC-0002',
    name: 'Ana Paula Oliveira',
    cpf: '234.567.890-11',
    age: 55,
    diagnosis: ['Câncer de Colo do Útero'],
    status: 'attention',
    lineStatus: 'Consulta pendente',
    unit: 'UBS Jardim Norte',
    lastVisit: '2026-05-29',
    riskScore: 6.2,
  },
  {
    id: 3,
    code: 'PAC-0003',
    name: 'Juliana Costa',
    cpf: '345.678.901-22',
    age: 42,
    diagnosis: ['Câncer de Mama'],
    status: 'stable',
    lineStatus: 'Em dia',
    unit: 'Ambulatório Regional',
    lastVisit: '2026-05-28',
    riskScore: 3.1,
  },
  {
    id: 4,
    code: 'PAC-0004',
    name: 'Fernanda Lima',
    cpf: '456.789.012-33',
    age: 51,
    diagnosis: ['Câncer de Colo do Útero'],
    status: 'critical',
    lineStatus: 'Exame alterado',
    unit: 'Ambulatório Regional',
    lastVisit: '2026-05-30',
    riskScore: 9.2,
  },
  {
    id: 5,
    code: 'PAC-0005',
    name: 'Carolina Mendes',
    cpf: '567.890.123-44',
    age: 39,
    diagnosis: ['Câncer de Mama'],
    status: 'stable',
    lineStatus: 'Em dia',
    unit: 'UBS Leste',
    lastVisit: '2026-05-27',
    riskScore: 2.8,
  },
  {
    id: 6,
    code: 'PAC-0006',
    name: 'Patricia Rodrigues',
    cpf: '678.901.234-55',
    age: 46,
    diagnosis: ['Câncer de Mama', 'Câncer de Colo do Útero'],
    status: 'attention',
    lineStatus: 'Busca ativa',
    unit: 'UBS Central',
    lastVisit: '2026-05-26',
    riskScore: 7.1,
  },
];

function maskCpf(cpf: string) {
  return cpf.replace(/^(\d{3})\.\d{3}\.\d{3}-(\d{2})$/, '$1.***.***-$2');
}

function getStatusLabel(status: string) {
  if (status === 'critical') return 'Crítico';
  if (status === 'attention') return 'Atenção';
  return 'Estável';
}

export function Pacientes() {
  return (
    <>
      <div className="mb-8">
        <div className="flex flex-col gap-4 mb-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-950">Pacientes</h1>
            <p className="text-slate-600 mt-2 max-w-2xl">
              Acompanhe risco, pendências e continuidade do cuidado das pacientes na rede SUS.
            </p>
          </div>
          <Link to="/pacientes/novo">
            <Button className="bg-teal-700 hover:bg-teal-800 shadow-sm">
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
                placeholder="Buscar por nome, código ou CPF mascarado..."
                className="pl-10 rounded-lg border-slate-200"
              />
            </div>
            <Select>
              <SelectTrigger className="w-full xl:w-52 rounded-lg">
                <SelectValue placeholder="Tipo de câncer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="mama">Câncer de Mama</SelectItem>
                <SelectItem value="colo">Câncer de Colo do Útero</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-full xl:w-48 rounded-lg">
                <SelectValue placeholder="Risco" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="critical">Crítico</SelectItem>
                <SelectItem value="attention">Atenção</SelectItem>
                <SelectItem value="stable">Estável</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-full xl:w-56 rounded-lg">
                <SelectValue placeholder="Linha do cuidado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="late">Com atraso</SelectItem>
                <SelectItem value="active-search">Busca ativa</SelectItem>
                <SelectItem value="ok">Em dia</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {patients.map((patient) => (
          <Link key={patient.id} to={`/pacientes/${patient.id}`}>
            <Card className="p-5 bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 rounded-lg h-full">
              <div className="flex items-start gap-4 mb-4">
                <div
                  className={`size-14 rounded-lg flex items-center justify-center font-bold text-white text-base ${
                    patient.status === 'critical'
                      ? 'bg-red-700'
                      : patient.status === 'attention'
                      ? 'bg-amber-600'
                      : 'bg-teal-700'
                  }`}
                >
                  {patient.name.split(' ')[0][0]}
                  {patient.name.split(' ')[1][0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-slate-950 truncate">{patient.name}</h3>
                  </div>
                  <p className="text-sm text-slate-500">{patient.age} anos • {patient.code}</p>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                    <ShieldCheck className="size-3" /> CPF protegido: {maskCpf(patient.cpf)}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-xs text-slate-500 mb-2">Diagnóstico</p>
                  <div className="flex flex-wrap gap-2">
                    {patient.diagnosis.map((diag, idx) => (
                      <Badge key={idx} variant="secondary" className="bg-slate-100 text-slate-700">
                        {diag}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100">
                  <div>
                    <p className="text-xs text-slate-500">Score de risco</p>
                    <p className="text-lg font-bold text-slate-950">{patient.riskScore.toFixed(1)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Status</p>
                    <Badge
                      variant={
                        patient.status === 'critical'
                          ? 'destructive'
                          : patient.status === 'attention'
                          ? 'outline'
                          : 'secondary'
                      }
                      className={patient.status === 'attention' ? 'border-amber-300 bg-amber-50 text-amber-800' : ''}
                    >
                      {getStatusLabel(patient.status)}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-600 pt-3 border-t border-slate-100">
                  <p className="flex items-center gap-2">
                    <MapPin className="size-4 text-slate-400" /> {patient.unit}
                  </p>
                  <p className="flex items-center gap-2">
                    <CalendarDays className="size-4 text-slate-400" /> Última visita: {new Date(patient.lastVisit).toLocaleDateString('pt-BR')}
                  </p>
                  <p className="font-medium text-slate-800">Linha do cuidado: {patient.lineStatus}</p>
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <Outlet />
    </>
  );
}
