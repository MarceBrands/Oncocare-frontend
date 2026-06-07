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
  Pencil,
  Save,
} from 'lucide-react';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../components/ui/dialog';
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

type BioimpedanciaForm = {
  peso: string;
  altura: string;
  massaMagra: string;
  massaGorda: string;
  aguaCorporal: string;
  anguloFase: string;
};

const initialExamsData: Record<string, ExamResult[]> = {
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
      name: 'Hematocrito',
      value: 28.5,
      unit: '%',
      reference: '36.0 - 46.0',
      status: 'critical',
      trend: 'down',
    },
    {
      name: 'Leucocitos',
      value: 4200,
      unit: '/uL',
      reference: '4500 - 11000',
      status: 'low',
      trend: 'down',
    },
    {
      name: 'Neutrofilos',
      value: 1800,
      unit: '/uL',
      reference: '2000 - 7500',
      status: 'low',
      trend: 'down',
    },
    {
      name: 'Linfocitos',
      value: 1900,
      unit: '/uL',
      reference: '1000 - 4000',
      status: 'normal',
      trend: 'stable',
    },
    {
      name: 'Plaquetas',
      value: 180000,
      unit: '/uL',
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
      name: 'Sodio',
      value: 138,
      unit: 'mEq/L',
      reference: '136 - 145',
      status: 'normal',
      trend: 'stable',
    },
    {
      name: 'Potassio',
      value: 4.2,
      unit: 'mEq/L',
      reference: '3.5 - 5.0',
      status: 'normal',
      trend: 'stable',
    },
    {
      name: 'Calcio',
      value: 9.1,
      unit: 'mg/dL',
      reference: '8.5 - 10.5',
      status: 'normal',
      trend: 'stable',
    },
    {
      name: 'Magnesio',
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
  { id: 'funcaoRenal', name: 'Funcao Renal', icon: FileText },
  { id: 'funcaoHepatica', name: 'Funcao Hepatica', icon: FileText },
  { id: 'eletrolitos', name: 'Eletrolitos', icon: Activity },
  { id: 'inflamacao', name: 'Inflamacao', icon: AlertTriangle },
];

const initialBioimpedancia: BioimpedanciaForm = {
  peso: '68,5',
  altura: '1,61',
  massaMagra: '42,5',
  massaGorda: '32,8',
  aguaCorporal: '51,2',
  anguloFase: '5,1',
};

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
      return 'Critico';
    default:
      return status;
  }
};

function toNumber(value: string) {
  return Number(value.replace(',', '.'));
}

function formatDecimal(value: number) {
  if (!Number.isFinite(value)) {
    return '-';
  }

  return value.toFixed(1).replace('.', ',');
}

function calculateImc(peso: string, altura: string) {
  const pesoNumber = toNumber(peso);
  const alturaNumber = toNumber(altura);

  if (!pesoNumber || !alturaNumber) {
    return '-';
  }

  return formatDecimal(pesoNumber / (alturaNumber * alturaNumber));
}

function getBioimpedanciaData(bio: BioimpedanciaForm) {
  return [
    { key: 'peso', label: 'Peso', value: bio.peso || '-', unit: 'kg', reference: 'Acompanhar evolucao' },
    { key: 'altura', label: 'Altura', value: bio.altura || '-', unit: 'm', reference: 'Usada para calculo do IMC' },
    { key: 'imc', label: 'IMC', value: calculateImc(bio.peso, bio.altura), unit: 'kg/m2', reference: '18,5 - 24,9' },
    { key: 'massaMagra', label: 'Massa magra', value: bio.massaMagra || '-', unit: 'kg', reference: 'Comparar por consulta' },
    { key: 'massaGorda', label: 'Massa gorda', value: bio.massaGorda || '-', unit: '%', reference: 'Acompanhar reducao ou ganho' },
    { key: 'aguaCorporal', label: 'Agua corporal', value: bio.aguaCorporal || '-', unit: '%', reference: '45 - 60' },
    { key: 'anguloFase', label: 'Angulo de fase', value: bio.anguloFase || '-', unit: 'graus', reference: 'Observar tendencia' },
  ];
}

export function Exames() {
  const [selectedCategory, setSelectedCategory] = useState('hemograma');
  const [selectedPatient, setSelectedPatient] = useState('maria');
  const [examsData, setExamsData] = useState(initialExamsData);
  const [bioimpedancia, setBioimpedancia] = useState(initialBioimpedancia);

  const currentExams = examsData[selectedCategory] || [];
  const currentCategoryName = categories.find((c) => c.id === selectedCategory)?.name;
  const bioimpedanciaData = getBioimpedanciaData(bioimpedancia);
  const criticalCount = Object.values(examsData)
    .flat()
    .filter((e) => e.status === 'critical').length;
  const attentionCount = Object.values(examsData)
    .flat()
    .filter((e) => e.status === 'low' || e.status === 'high').length;

  function updateBioField(field: keyof BioimpedanciaForm, value: string) {
    setBioimpedancia((current) => ({ ...current, [field]: value }));
  }

  function updateExamValue(examName: string, value: string) {
    const nextValue = Number(value);

    setExamsData((current) => ({
      ...current,
      [selectedCategory]: current[selectedCategory].map((exam) =>
        exam.name === examName
          ? { ...exam, value: Number.isNaN(nextValue) ? 0 : nextValue }
          : exam
      ),
    }));
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Exames Laboratoriais</h1>
        <p className="text-gray-500 mt-2">
          Acompanhamento detalhado de resultados laboratoriais
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <Card className="p-6 bg-white border-0 shadow-lg rounded-2xl">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
              <AlertTriangle className="size-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Valores Criticos</p>
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
              <p className="text-sm text-gray-500">Requer Atencao</p>
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
            Ultima coleta: 28/05/2026
          </Badge>
        </div>
      </Card>

      <Card className="mb-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-950">Bioimpedancia</h2>
            <p className="text-sm text-slate-600">
              Dados corporais para acompanhar nutricao, massa muscular e evolucao durante o tratamento.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="w-fit border-cyan-200 bg-cyan-50 text-cyan-800">
              Ultima avaliacao: 28/05/2026
            </Badge>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="rounded-lg">
                  <Pencil className="size-4" />
                  Incluir/alterar
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Incluir ou alterar bioimpedancia</DialogTitle>
                  <DialogDescription>
                    Preencha os dados medidos. O IMC e calculado automaticamente por peso e altura.
                  </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <BioField label="Peso" unit="kg" value={bioimpedancia.peso} onChange={(value) => updateBioField('peso', value)} />
                  <BioField label="Altura" unit="m" value={bioimpedancia.altura} onChange={(value) => updateBioField('altura', value)} />
                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <p className="text-xs text-slate-500">IMC calculado</p>
                    <p className="mt-1 text-xl font-bold text-slate-950">
                      {calculateImc(bioimpedancia.peso, bioimpedancia.altura)} kg/m2
                    </p>
                  </div>
                  <BioField label="Massa magra" unit="kg" value={bioimpedancia.massaMagra} onChange={(value) => updateBioField('massaMagra', value)} />
                  <BioField label="Massa gorda" unit="%" value={bioimpedancia.massaGorda} onChange={(value) => updateBioField('massaGorda', value)} />
                  <BioField label="Agua corporal" unit="%" value={bioimpedancia.aguaCorporal} onChange={(value) => updateBioField('aguaCorporal', value)} />
                  <BioField label="Angulo de fase" unit="graus" value={bioimpedancia.anguloFase} onChange={(value) => updateBioField('anguloFase', value)} />
                </div>

                <DialogFooter>
                  <DialogClose asChild>
                    <Button className="rounded-lg bg-cyan-700 hover:bg-cyan-800">
                      <Save className="size-4" />
                      Aplicar dados
                    </Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {bioimpedanciaData.map((item) => (
            <div key={item.label} className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase text-slate-500">{item.label}</p>
              <p className="mt-2 text-2xl font-bold text-slate-950">
                {item.value}
                <span className="ml-1 text-sm font-medium text-slate-500">{item.unit}</span>
              </p>
              <p className="mt-2 text-xs text-slate-500">Referencia: {item.reference}</p>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
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

        <div className="lg:col-span-3 space-y-6">
          <Card className="p-6 bg-white border-0 shadow-lg rounded-2xl">
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                {currentCategoryName}
              </h3>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="rounded-lg">
                    <Pencil className="size-4" />
                    Incluir/alterar exames
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-3xl">
                  <DialogHeader>
                    <DialogTitle>Incluir ou alterar {currentCategoryName}</DialogTitle>
                    <DialogDescription>
                      Atualize os valores laboratoriais da categoria selecionada.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="max-h-[60vh] overflow-auto pr-2">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {currentExams.map((exam) => (
                        <div key={exam.name}>
                          <Label>{exam.name}</Label>
                          <div className="mt-2 flex rounded-lg border border-slate-200 bg-white">
                            <Input
                              type="number"
                              value={exam.value}
                              onChange={(event) => updateExamValue(exam.name, event.target.value)}
                              className="rounded-r-none border-0"
                            />
                            <span className="flex min-w-20 items-center justify-center border-l border-slate-200 px-3 text-sm text-slate-500">
                              {exam.unit}
                            </span>
                          </div>
                          <p className="mt-1 text-xs text-slate-500">Referencia: {exam.reference}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <DialogFooter>
                    <DialogClose asChild>
                      <Button className="rounded-lg bg-cyan-700 hover:bg-cyan-800">
                        <Save className="size-4" />
                        Aplicar exames
                      </Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Exame</TableHead>
                    <TableHead className="text-center">Valor</TableHead>
                    <TableHead className="text-center">Referencia</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-center">Tendencia</TableHead>
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

          {selectedCategory === 'hemograma' && (
            <Card className="p-6 bg-white border-0 shadow-lg rounded-2xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingDown className="size-5 text-red-600" />
                Evolucao da Hemoglobina
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
                    label={{ value: 'Min: 12', fill: '#10b981', fontSize: 12 }}
                  />
                  <ReferenceLine
                    y={16}
                    stroke="#10b981"
                    strokeDasharray="3 3"
                    label={{ value: 'Max: 16', fill: '#10b981', fontSize: 12 }}
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
                    Alerta: Hemoglobina Critica
                  </p>
                </div>
                <p className="text-sm text-red-700">
                  Valor atual 7.2 g/dL esta 42% abaixo do limite minimo aceitavel.
                  Recomenda-se avaliacao urgente e possivel transfusao sanguinea.
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

function BioField({
  label,
  unit,
  value,
  onChange,
}: {
  label: string;
  unit: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="mt-2 flex rounded-lg border border-slate-200 bg-white">
        <Input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="rounded-r-none border-0"
          placeholder="Informar valor"
        />
        <span className="flex min-w-20 items-center justify-center border-l border-slate-200 px-3 text-sm text-slate-500">
          {unit}
        </span>
      </div>
    </div>
  );
}
