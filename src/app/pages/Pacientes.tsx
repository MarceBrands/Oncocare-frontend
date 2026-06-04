import { Outlet, Link } from 'react-router';
import { Plus, Search, Filter } from 'lucide-react';
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
    name: 'Maria Santos Silva',
    cpf: '123.456.789-00',
    age: 48,
    diagnosis: ['Câncer de Mama'],
    status: 'critical',
    lastVisit: '2026-05-30',
    riskScore: 8.5,
  },
  {
    id: 2,
    name: 'Ana Paula Oliveira',
    cpf: '234.567.890-11',
    age: 55,
    diagnosis: ['Câncer de Colo do Útero'],
    status: 'attention',
    lastVisit: '2026-05-29',
    riskScore: 6.2,
  },
  {
    id: 3,
    name: 'Juliana Costa',
    cpf: '345.678.901-22',
    age: 42,
    diagnosis: ['Câncer de Mama'],
    status: 'stable',
    lastVisit: '2026-05-28',
    riskScore: 3.1,
  },
  {
    id: 4,
    name: 'Fernanda Lima',
    cpf: '456.789.012-33',
    age: 51,
    diagnosis: ['Câncer de Colo do Útero'],
    status: 'critical',
    lastVisit: '2026-05-30',
    riskScore: 9.2,
  },
  {
    id: 5,
    name: 'Carolina Mendes',
    cpf: '567.890.123-44',
    age: 39,
    diagnosis: ['Câncer de Mama'],
    status: 'stable',
    lastVisit: '2026-05-27',
    riskScore: 2.8,
  },
  {
    id: 6,
    name: 'Patricia Rodrigues',
    cpf: '678.901.234-55',
    age: 46,
    diagnosis: ['Câncer de Mama', 'Câncer de Colo do Útero'],
    status: 'attention',
    lastVisit: '2026-05-26',
    riskScore: 7.1,
  },
];

export function Pacientes() {
  return (
    <>
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Pacientes</h1>
            <p className="text-gray-500 mt-2">
              Gerencie e acompanhe suas pacientes oncológicas
            </p>
          </div>
          <Link to="/pacientes/novo">
            <Button className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 shadow-lg">
              <Plus className="size-5 mr-2" />
              Nova Paciente
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <Card className="p-4 bg-white border-0 shadow-lg rounded-2xl">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-5 text-gray-400" />
              <Input
                placeholder="Buscar por nome ou CPF..."
                className="pl-10 rounded-xl border-gray-200"
              />
            </div>
            <Select>
              <SelectTrigger className="w-full sm:w-48 rounded-xl">
                <SelectValue placeholder="Tipo de câncer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="mama">Câncer de Mama</SelectItem>
                <SelectItem value="colo">Câncer de Colo do Útero</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-full sm:w-48 rounded-xl">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="critical">Crítico</SelectItem>
                <SelectItem value="attention">Atenção</SelectItem>
                <SelectItem value="stable">Estável</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>
      </div>

      {/* Patients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {patients.map((patient) => (
          <Link key={patient.id} to={`/pacientes/${patient.id}`}>
            <Card className="p-6 bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl h-full">
              <div className="flex items-start gap-4 mb-4">
                <div
                  className={`size-16 rounded-2xl flex items-center justify-center font-bold text-white text-lg ${
                    patient.status === 'critical'
                      ? 'bg-gradient-to-br from-red-400 to-red-600'
                      : patient.status === 'attention'
                      ? 'bg-gradient-to-br from-yellow-400 to-yellow-600'
                      : 'bg-gradient-to-br from-green-400 to-green-600'
                  }`}
                >
                  {patient.name.split(' ')[0][0]}
                  {patient.name.split(' ')[1][0]}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {patient.name}
                  </h3>
                  <p className="text-sm text-gray-500">{patient.age} anos</p>
                  <p className="text-xs text-gray-400 mt-1">{patient.cpf}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500 mb-2">Diagnóstico:</p>
                  <div className="flex flex-wrap gap-2">
                    {patient.diagnosis.map((diag, idx) => (
                      <Badge
                        key={idx}
                        variant="secondary"
                        className="bg-purple-100 text-purple-700"
                      >
                        {diag}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div>
                    <p className="text-xs text-gray-500">Score de Risco</p>
                    <p className="text-lg font-bold text-gray-900">
                      {patient.riskScore.toFixed(1)}
                    </p>
                  </div>
                  <Badge
                    variant={
                      patient.status === 'critical'
                        ? 'destructive'
                        : patient.status === 'attention'
                        ? 'outline'
                        : 'secondary'
                    }
                  >
                    {patient.status === 'critical'
                      ? 'Crítico'
                      : patient.status === 'attention'
                      ? 'Atenção'
                      : 'Estável'}
                  </Badge>
                </div>

                <div className="text-xs text-gray-500 pt-2 border-t border-gray-100">
                  Última visita:{' '}
                  {new Date(patient.lastVisit).toLocaleDateString('pt-BR')}
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
