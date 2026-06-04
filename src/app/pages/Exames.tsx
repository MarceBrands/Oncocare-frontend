import { useState } from 'react';
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

interface ExamResult {
  name: string;
  value: number;
  unit: string;
  reference: string;
  status: 'normal' | 'low' | 'high' | 'critical';
  trend?: 'up' | 'down' | 'stable';
}

const examsData: Record<string, ExamResult[]> = {
  hemograma: [
    {
      name: 'Hemoglobina',
      value: 7.2,
      unit: 'g/dL',
      reference: '12.0 - 16.0',
      status: 'critical',
      trend: 'down',
    },
    {
      name: 'Hematócrito',
      value: 28.5,
      unit: '%',
      reference: '36.0 - 46.0',
      status: 'critical',
      trend: 'down',
    },
    {
      name: 'Leucócitos',
      value: 4200,
      unit: '/µL',
      reference: '4500 - 11000',
      status: 'low',
      trend: 'down',
    },
    {
      name: 'Neutrófilos',
      value: 1800,
      unit: '/µL',
      reference: '2000 - 7500',
      status: 'low',
      trend: 'down',
    },
    {
      name: 'Linfócitos',
      value: 1900,
      unit: '/µL',
      reference: '1000 - 4000',
      status: 'normal',
      trend: 'stable',
    },
    {
      name: 'Plaquetas',
      value: 180000,
      unit: '/µL',
      reference: '150000 - 400000',
      status: 'normal',
      trend: 'down',
    },
  ],
  funcaoRenal: [
    {
      name: 'Creatinina',
      value: 1.3,
      unit: 'mg/dL',
      reference: '0.6 - 1.2',
      status: 'high',
      trend: 'up',
    },
    {
      name: 'Ureia',
      value: 52,
      unit: 'mg/dL',
      reference: '15 - 45',
      status: 'high',
      trend: 'up',
    },
  ],
  funcaoHepatica: [
    {
      name: 'TGO/AST',
      value: 38,
      unit: 'U/L',
      reference: '< 40',
      status: 'normal',
      trend: 'stable',
    },
    {
      name: 'TGP/ALT',
      value: 42,
      unit: 'U/L',
      reference: '< 41',
      status: 'high',
      trend: 'up',
    },
    {
      name: 'Fosfatase Alcalina',
      value: 95,
      unit: 'U/L',
      reference: '40 - 150',
      status: 'normal',
      trend: 'stable',
    },
    {
      name: 'GGT',
      value: 35,
      unit: 'U/L',
      reference: '< 55',
      status: 'normal',
      trend: 'stable',
    },
    {
      name: 'Bilirrubina Total',
      value: 0.8,
      unit: 'mg/dL',
      reference: '< 1.2',
      status: 'normal',
      trend: 'stable',
    },
    {
      name: 'Albumina',
      value: 3.2,
      unit: 'g/dL',
      reference: '3.5 - 5.5',
      status: 'low',
      trend: 'down',
    },
  ],
  eletrolitos: [
    {
      name: 'Sódio',
      value: 138,
      unit: 'mEq/L',
      reference: '136 - 145',
      status: 'normal',
      trend: 'stable',
    },
    {
      name: 'Potássio',
      value: 4.2,
      unit: 'mEq/L',
      reference: '3.5 - 5.0',
      status: 'normal',
      trend: 'stable',
    },
    {
      name: 'Cálcio',
      value: 9.1,
      unit: 'mg/dL',
      reference: '8.5 - 10.5',
      status: 'normal',
      trend: 'stable',
    },
    {
      name: 'Magnésio',
      value: 1.7,
      unit: 'mg/dL',
      reference: '1.7 - 2.2',
      status: 'normal',
      trend: 'stable',
    },
  ],
  inflamacao: [
    {
      name: 'PCR',
      value: 85,
      unit: 'mg/L',
      reference: '< 5',
      status: 'critical',
      trend: 'up',
    },
  ],
};

const categories = [
  { id: 'hemograma', name: 'Hemograma', icon: Activity },
  { id: 'funcaoRenal', name: 'Função Renal', icon: FileText },
  { id: 'funcaoHepatica', name: 'Função Hepática', icon: FileText },
  { id: 'eletrolitos', name: 'Eletrólitos', icon: Activity },
  { id: 'inflamacao', name: 'Inflamação', icon: AlertTriangle },
];

const hemoglobinaHistory = [
  { month: 'Jan', value: 12.5, min: 12, max: 16 },
  { month: 'Fev', value: 11.8, min: 12, max: 16 },
  { month: 'Mar', value: 10.2, min: 12, max: 16 },
  { month: 'Abr', value: 9.5, min: 12, max: 16 },
  { month: 'Mai', value: 7.2, min: 12, max: 16 },
];

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
  const [selectedCategory, setSelectedCategory] = useState('hemograma');
  const [selectedPatient, setSelectedPatient] = useState('maria');

  const currentExams = examsData[selectedCategory] || [];
  const criticalCount = Object.values(examsData)
    .flat()
    .filter((e) => e.status === 'critical').length;
  const attentionCount = Object.values(examsData)
    .flat()
    .filter((e) => e.status === 'low' || e.status === 'high').length;

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Exames Laboratoriais</h1>
        <p className="text-gray-500 mt-2">
          Acompanhamento detalhado de resultados laboratoriais
        </p>
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
                {Object.values(examsData).flat().filter((e) => e.status === 'normal')
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
              <SelectItem value="maria">Maria Santos Silva</SelectItem>
              <SelectItem value="ana">Ana Paula Oliveira</SelectItem>
              <SelectItem value="juliana">Juliana Costa</SelectItem>
            </SelectContent>
          </Select>
          <Badge variant="outline" className="ml-auto">
            Última coleta: 28/05/2026
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
              {categories.map((category) => {
                const categoryExams = examsData[category.id] || [];
                const hasCritical = categoryExams.some(
                  (e) => e.status === 'critical'
                );
                const hasAttention = categoryExams.some(
                  (e) => e.status === 'low' || e.status === 'high'
                );

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
                    <category.icon className="size-5" />
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
              {categories.find((c) => c.id === selectedCategory)?.name}
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
                  {currentExams.map((exam, idx) => (
                    <TableRow key={idx}>
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
                <LineChart data={hemoglobinaHistory}>
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
                  <ReferenceLine
                    y={12}
                    stroke="#10b981"
                    strokeDasharray="3 3"
                    label={{ value: 'Mín: 12', fill: '#10b981', fontSize: 12 }}
                  />
                  <ReferenceLine
                    y={16}
                    stroke="#10b981"
                    strokeDasharray="3 3"
                    label={{ value: 'Máx: 16', fill: '#10b981', fontSize: 12 }}
                  />
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
              <div className="mt-4 p-4 bg-red-50 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="size-5 text-red-600" />
                  <p className="font-semibold text-red-900">
                    Alerta: Hemoglobina Crítica
                  </p>
                </div>
                <p className="text-sm text-red-700">
                  Valor atual 7.2 g/dL está 42% abaixo do limite mínimo aceitável.
                  Recomenda-se avaliação urgente e possível transfusão sanguínea.
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>

      <Outlet />
    </>
  );
}
