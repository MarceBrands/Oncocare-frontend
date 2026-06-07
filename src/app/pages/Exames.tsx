import { useEffect, useState } from 'react';
import { Outlet } from 'react-router';
import {
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle,
  FileText,
} from 'lucide-react';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { getExamsOverview, type ExamsOverview } from '../../lib/api';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'normal':
      return 'text-green-600 bg-green-50';
    case 'low':
      return 'text-yellow-600 bg-yellow-50';
    case 'high':
      return 'text-orange-600 bg-orange-50';
    case 'critical':
      return 'text-red-600 bg-red-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case 'normal':
      return <CheckCircle className="size-5" />;
    case 'low':
    case 'high':
      return <AlertTriangle className="size-5" />;
    case 'critical':
      return <AlertTriangle className="size-5" />;
    default:
      return null;
  }
};

const getTrendIcon = (trend?: string) => {
  switch (trend) {
    case 'up':
      return <TrendingUp className="size-4" />;
    case 'down':
      return <TrendingDown className="size-4" />;
    case 'stable':
      return <Minus className="size-4" />;
    default:
      return null;
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'normal':
      return 'Normal';
    case 'low':
      return 'Baixo';
    case 'high':
      return 'Alto';
    case 'critical':
      return 'Crítico';
    default:
      return status;
  }
};

export function Exames() {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedPatient, setSelectedPatient] = useState('');
  const [overview, setOverview] = useState<ExamsOverview | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadExams() {
      try {
        const data = await getExamsOverview(selectedPatient || undefined);
        setOverview(data);

        if (data.selectedPatientId && !selectedPatient) {
          setSelectedPatient(data.selectedPatientId);
        }

        if (data.categories.length > 0 && !data.categories.some((item) => item.id === selectedCategory)) {
          setSelectedCategory(data.categories[0].id);
        }
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : 'Erro inesperado.');
      }
    }

    loadExams();
  }, [selectedPatient]);

  const currentExamsData = overview?.examsData ?? {};
  const currentCategories = overview?.categories ?? [];
  const currentHistory = overview?.hemoglobinaHistory ?? [];
  const currentExams = currentExamsData[selectedCategory] || [];
  const hemoglobinaReference = currentHistory.find((item) => item.min && item.max);
  const latestHemoglobina = currentHistory.at(-1);
  const criticalCount = Object.values(currentExamsData)
    .flat()
    .filter((e) => e.status === 'critical').length;
  const attentionCount = Object.values(currentExamsData)
    .flat()
    .filter((e) => e.status === 'low' || e.status === 'high').length;
  const iconMap = {
    activity: Activity,
    file: FileText,
    alert: AlertTriangle,
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Exames Laboratoriais</h1>
        <p className="text-gray-500 mt-2">
          Acompanhamento detalhado de resultados laboratoriais
        </p>
        {!overview && !error && <p className="mt-2 text-sm text-gray-500">Carregando exames...</p>}
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <Card className="p-6 bg-white border-0 shadow-lg rounded-2xl">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
              <AlertTriangle className="size-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Valores Críticos</p>
              <p className="text-2xl font-bold text-gray-900">{criticalCount}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white border-0 shadow-lg rounded-2xl">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-xl bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center">
              <AlertTriangle className="size-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Requer Atenção</p>
              <p className="text-2xl font-bold text-gray-900">{attentionCount}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white border-0 shadow-lg rounded-2xl">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
              <CheckCircle className="size-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Dentro da Normalidade</p>
              <p className="text-2xl font-bold text-gray-900">
                {Object.values(currentExamsData).flat().filter((e) => e.status === 'normal')
                  .length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Patient Selector */}
      <Card className="p-4 bg-white border-0 shadow-lg rounded-2xl mb-6">
        <div className="flex items-center gap-4">
          <p className="text-sm font-medium text-gray-700">Paciente:</p>
          <Select value={selectedPatient} onValueChange={setSelectedPatient}>
            <SelectTrigger className="w-64 rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(overview?.patients ?? []).map((patient) => (
                <SelectItem key={patient.id} value={patient.id}>
                  {patient.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Badge variant="outline" className="ml-auto">
            Última coleta: {overview?.lastCollection ? new Date(`${overview.lastCollection}T00:00:00`).toLocaleDateString('pt-BR') : 'Sem coleta'}
          </Badge>
        </div>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Categories Sidebar */}
        <div className="lg:col-span-1">
          <Card className="p-4 bg-white border-0 shadow-lg rounded-2xl">
            <p className="text-sm font-semibold text-gray-900 mb-3">Categorias</p>
            <div className="space-y-2">
              {currentCategories.map((category) => {
                const categoryExams = currentExamsData[category.id] || [];
                const hasCritical = categoryExams.some(
                  (e) => e.status === 'critical'
                );
                const hasAttention = categoryExams.some(
                  (e) => e.status === 'low' || e.status === 'high'
                );

                const CategoryIcon = iconMap[category.iconKey as keyof typeof iconMap] ?? FileText;

                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
                      selectedCategory === category.id
                        ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg'
                        : 'hover:bg-purple-50 text-gray-700'
                    }`}
                  >
                    <CategoryIcon className="size-5" />
                    <span className="text-sm font-medium flex-1 text-left">
                      {category.name}
                    </span>
                    {hasCritical && (
                      <div className="size-2 rounded-full bg-red-500" />
                    )}
                    {!hasCritical && hasAttention && (
                      <div className="size-2 rounded-full bg-yellow-500" />
                    )}
                  </button>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Results Table */}
        <div className="lg:col-span-3 space-y-6">
          <Card className="p-6 bg-white border-0 shadow-lg rounded-2xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {currentCategories.find((c) => c.id === selectedCategory)?.name ?? 'Selecione uma categoria'}
            </h3>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Exame</TableHead>
                    <TableHead className="text-center">Valor</TableHead>
                    <TableHead className="text-center">Referência</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-center">Tendência</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentExams.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="py-8 text-center text-sm text-gray-500">
                        Nenhum exame registrado.
                      </TableCell>
                    </TableRow>
                  )}
                  {currentExams.map((exam) => (
                    <TableRow key={exam.id}>
                      <TableCell className="font-medium">{exam.name}</TableCell>
                      <TableCell className="text-center">
                        <span className="font-semibold">
                          {exam.value} {exam.unit}
                        </span>
                      </TableCell>
                      <TableCell className="text-center text-sm text-gray-500">
                        {exam.reference}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          className={`${getStatusColor(exam.status)} flex items-center gap-1 justify-center w-fit mx-auto`}
                        >
                          {getStatusIcon(exam.status)}
                          {getStatusText(exam.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center">
                          {getTrendIcon(exam.trend)}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>

          {/* Evolution Chart - Show only for Hemograma */}
          {selectedCategory === 'hemograma' && (
            <Card className="p-6 bg-white border-0 shadow-lg rounded-2xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingDown className="size-5 text-red-600" />
                Evolução da Hemoglobina
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={currentHistory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" stroke="#888" />
                  <YAxis stroke="#888" domain={[0, 18]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    }}
                  />
                  {hemoglobinaReference && (
                    <ReferenceLine
                      y={hemoglobinaReference.min}
                      stroke="#10b981"
                      strokeDasharray="3 3"
                      label={{
                        value: `Min: ${hemoglobinaReference.min}`,
                        fill: '#10b981',
                        fontSize: 12,
                      }}
                    />
                  )}
                  {hemoglobinaReference && (
                    <ReferenceLine
                      y={hemoglobinaReference.max}
                      stroke="#10b981"
                      strokeDasharray="3 3"
                      label={{
                        value: `Max: ${hemoglobinaReference.max}`,
                        fill: '#10b981',
                        fontSize: 12,
                      }}
                    />
                  )}
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#ef4444"
                    strokeWidth={3}
                    dot={{ fill: '#ef4444', r: 6 }}
                    name="Hemoglobina (g/dL)"
                  />
                </LineChart>
              </ResponsiveContainer>
              {latestHemoglobina && hemoglobinaReference && latestHemoglobina.value < hemoglobinaReference.min && (
                <div className="mt-4 p-4 bg-red-50 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="size-5 text-red-600" />
                  <p className="font-semibold text-red-900">
                    Alerta: Hemoglobina abaixo da referencia
                  </p>
                </div>
                <p className="text-sm text-red-700">
                  Valor atual {latestHemoglobina.value} g/dL está abaixo do limite mínimo
                  de {hemoglobinaReference.min} g/dL.
                </p>
              </div>
              )}
            </Card>
          )}
        </div>
      </div>

      <Outlet />
    </>
  );
}
