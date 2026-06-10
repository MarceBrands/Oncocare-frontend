import { useEffect, useMemo, useState } from 'react';
import { Outlet } from 'react-router';
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  FileText,
  Scale,
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
import { supabase, type PacienteRow } from '../../lib/supabase';

export type ExamStatus = 'normal' | 'attention' | 'high' | 'critical';
export type ExamTrend = 'up' | 'down' | 'stable';
type PatientReferenceProfile = 'adultFemale';

export interface ExamResult {
  name: string;
  value: number;
  unit: string;
  reference: string;
  status: ExamStatus;
  trend?: ExamTrend;
}

type ExamDefinition = {
  name: string;
  unit: string;
  references: Record<PatientReferenceProfile, string>;
  classify: (value: number, profile: PatientReferenceProfile) => ExamStatus;
};

type PatientExamRow = {
  id: string;
  paciente_id: string;
  categoria: string;
  nome: string;
  valor: number;
  unidade: string | null;
  data_coleta: string | null;
};

type BioimpedanciaRow = {
  id: string;
  paciente_id: string;
  data_avaliacao: string;
  peso: number | null;
  altura: number | null;
  massa_magra: number | null;
  massa_gorda: number | null;
  agua_corporal: number | null;
  angulo_fase: number | null;
};

const defaultReferenceProfile: PatientReferenceProfile = 'adultFemale';
export const referenceContextText = 'Valores de referência para mulheres adultas.';

function rangeReference(
  min: number,
  max: number,
  reference: string,
  unit: string,
  critical?: { below?: number; above?: number }
): ExamDefinition {
  return {
    name: '',
    unit,
    references: { adultFemale: reference },
    classify: (value) => {
      if (critical?.below !== undefined && value < critical.below) return 'critical';
      if (critical?.above !== undefined && value > critical.above) return 'critical';
      if (value < min) return 'attention';
      if (value > max) return 'high';
      return 'normal';
    },
  };
}

function maxReference(max: number, reference: string, unit: string): ExamDefinition {
  return {
    name: '',
    unit,
    references: { adultFemale: reference },
    classify: (value) => (value < max ? 'normal' : 'high'),
  };
}

function defineExam(name: string, definition: ExamDefinition): ExamDefinition {
  return { ...definition, name };
}

const examCatalog: Record<string, ExamDefinition[]> = {
  hemograma: [
    defineExam('Hemoglobina', rangeReference(12, 16, '12.0 - 16.0', 'g/dL', { below: 8 })),
    defineExam('Hematócrito', rangeReference(35, 47, '35 - 47', '%')),
    defineExam('Leucócitos', rangeReference(4500, 11000, '4500 - 11000', '/µL')),
    defineExam('Neutrófilos', rangeReference(2000, 7500, '2000 - 7500', '/µL')),
    defineExam('Linfócitos', rangeReference(1000, 4000, '1000 - 4000', '/µL')),
    defineExam('Plaquetas', rangeReference(150000, 400000, '150000 - 400000', '/µL')),
  ],
  funcaoRenal: [
    defineExam('Creatinina', rangeReference(0.6, 1.2, '0.6 - 1.2', 'mg/dL')),
    defineExam('Ureia', rangeReference(15, 45, '15 - 45', 'mg/dL')),
  ],
  funcaoHepatica: [
    defineExam('TGO/AST', maxReference(40, '< 40', 'U/L')),
    defineExam('TGP/ALT', maxReference(41, '< 41', 'U/L')),
    defineExam('Fosfatase Alcalina', rangeReference(40, 150, '40 - 150', 'U/L')),
    defineExam('GGT', maxReference(55, '< 55', 'U/L')),
    defineExam('Bilirrubina Total', maxReference(1.2, '< 1.2', 'mg/dL')),
    defineExam('Albumina', rangeReference(3.5, 5.5, '3.5 - 5.5', 'g/dL')),
  ],
  eletrolitos: [
    defineExam('Sódio', rangeReference(136, 145, '136 - 145', 'mEq/L')),
    defineExam('Potássio', rangeReference(3.5, 5, '3.5 - 5.0', 'mEq/L')),
    defineExam('Cálcio', rangeReference(8.5, 10.5, '8.5 - 10.5', 'mg/dL')),
    defineExam('Magnésio', rangeReference(1.7, 2.2, '1.7 - 2.2', 'mg/dL')),
  ],
  inflamacao: [
    defineExam('PCR', {
      name: 'PCR',
      unit: 'mg/L',
      references: { adultFemale: '< 5' },
      classify: (value) => {
        if (value < 5) return 'normal';
        if (value <= 10) return 'attention';
        if (value <= 40) return 'high';
        return 'critical';
      },
    }),
  ],
};

export const categories = [
  { id: 'hemograma', name: 'Hemograma', icon: Activity },
  { id: 'funcaoRenal', name: 'Função Renal', icon: FileText },
  { id: 'funcaoHepatica', name: 'Função Hepática', icon: FileText },
  { id: 'eletrolitos', name: 'Eletrólitos', icon: Activity },
  { id: 'inflamacao', name: 'Inflamação', icon: AlertTriangle },
  { id: 'bioimpedancia', name: 'Bioimpedância', icon: Scale },
];

export const initialExamsData: Record<string, ExamResult[]> = Object.fromEntries(
  categories.map((category) => [category.id, []])
);

function getReferenceRows(categoryId: string) {
  return (examCatalog[categoryId] ?? []).map((exam) => ({
    name: exam.name,
    unit: exam.unit,
    reference: exam.references[defaultReferenceProfile],
  }));
}

function getExamDefinition(categoryId: string, examName: string) {
  return examCatalog[categoryId]?.find((exam) => exam.name === examName);
}

function createExamResult(exam: PatientExamRow): ExamResult {
  const definition = getExamDefinition(exam.categoria, exam.nome);

  if (!definition) {
    return {
      name: exam.nome,
      value: Number(exam.valor),
      unit: exam.unidade ?? '',
      reference: 'Não informado',
      status: 'attention',
    };
  }

  return {
    name: exam.nome,
    value: Number(exam.valor),
    unit: exam.unidade ?? definition.unit,
    reference: definition.references[defaultReferenceProfile],
    status: definition.classify(Number(exam.valor), defaultReferenceProfile),
  };
}

export const getStatusColor = (status: string) => {
  switch (status) {
    case 'normal':
      return 'text-green-600 bg-green-50';
    case 'attention':
      return 'text-yellow-600 bg-yellow-50';
    case 'high':
      return 'text-orange-600 bg-orange-50';
    case 'critical':
      return 'text-red-600 bg-red-50';
    default:
      return 'text-gray-600 bg-gray-50';
  }
};

export const getStatusText = (status: string) => {
  switch (status) {
    case 'normal':
      return 'Normal';
    case 'attention':
      return 'Atenção';
    case 'high':
      return 'Alto';
    case 'critical':
      return 'Crítico';
    default:
      return status;
  }
};

function formatNumber(value: number | null, digits = 1) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return '-';
  }

  return Number(value).toFixed(digits).replace('.', ',');
}

function formatDate(date: string | null) {
  if (!date) return 'Data não informada';

  const parsed = new Date(`${date}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? 'Data não informada' : parsed.toLocaleDateString('pt-BR');
}

function calculateImc(weight: number | null, height: number | null) {
  if (!weight || !height) {
    return null;
  }

  return weight / (height * height);
}

export function Exames({ patientMode = false }: { patientMode?: boolean } = {}) {
  const [selectedCategory, setSelectedCategory] = useState('hemograma');
  const [patients, setPatients] = useState<PacienteRow[]>([]);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [patientExams, setPatientExams] = useState<PatientExamRow[]>([]);
  const [bioimpedancia, setBioimpedancia] = useState<BioimpedanciaRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [examsLoading, setExamsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [examsUnavailable, setExamsUnavailable] = useState(false);

  useEffect(() => {
    async function loadPatients() {
      setLoading(true);
      setError(null);

      const { data, error: loadError } = await supabase
        .from('pacientes')
        .select('*')
        .order(patientMode ? 'created_at' : 'nome', { ascending: !patientMode });

      if (loadError) {
        setError(loadError.message);
        setPatients([]);
      } else {
        const loadedPatients = (data ?? []) as PacienteRow[];
        setPatients(loadedPatients);
        setSelectedPatient((current) => current || loadedPatients[0]?.id || '');
      }

      setLoading(false);
    }

    loadPatients();
  }, [patientMode]);

  useEffect(() => {
    async function loadExams() {
      if (!selectedPatient) {
        setPatientExams([]);
        setBioimpedancia(null);
        return;
      }

      setExamsLoading(true);
      setExamsUnavailable(false);

      const [
        { data: examData, error: examLoadError },
        { data: bioData, error: bioLoadError },
      ] = await Promise.all([
        supabase
          .from('paciente_exames')
          .select('id,paciente_id,categoria,nome,valor,unidade,data_coleta')
          .eq('paciente_id', selectedPatient)
          .order('data_coleta', { ascending: false }),
        supabase
          .from('paciente_bioimpedancia')
          .select('id,paciente_id,data_avaliacao,peso,altura,massa_magra,massa_gorda,agua_corporal,angulo_fase')
          .eq('paciente_id', selectedPatient)
          .order('data_avaliacao', { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);

      const loadError = examLoadError ?? bioLoadError;

      if (loadError) {
        setPatientExams([]);
        setBioimpedancia(null);
        setExamsUnavailable(loadError.message.includes('schema cache') || loadError.message.includes('Could not find the table'));
      } else {
        setPatientExams((examData ?? []) as PatientExamRow[]);
        setBioimpedancia((bioData ?? null) as BioimpedanciaRow | null);
      }

      setExamsLoading(false);
    }

    loadExams();
  }, [selectedPatient]);

  const selectedPatientName = patients.find((patient) => patient.id === selectedPatient)?.nome;
  const referenceRows = useMemo(() => getReferenceRows(selectedCategory), [selectedCategory]);
  const currentCategoryName = categories.find((category) => category.id === selectedCategory)?.name ?? 'Exames';
  const examResults = patientExams.map(createExamResult);
  const currentExams = examResults.filter((exam) => {
    return patientExams.some((row) => row.nome === exam.name && row.categoria === selectedCategory);
  });
  const criticalCount = examResults.filter((exam) => exam.status === 'critical').length;
  const attentionCount = examResults.filter((exam) => exam.status === 'attention' || exam.status === 'high').length;
  const normalCount = examResults.filter((exam) => exam.status === 'normal').length;
  const imc = calculateImc(bioimpedancia?.peso ?? null, bioimpedancia?.altura ?? null);

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-950">{patientMode ? 'Meus exames' : 'Exames Laboratoriais'}</h1>
        <p className="mt-2 text-slate-600">
          Valores de referência e resultados laboratoriais registrados para acompanhamento clínico.
        </p>
      </div>

      {loading && (
        <Card className="mb-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-slate-600">Carregando pacientes...</p>
        </Card>
      )}

      {!loading && error && (
        <Card className="mb-6 rounded-lg border border-red-200 bg-red-50 p-6 shadow-sm">
          <p className="font-semibold text-red-900">Não consegui carregar pacientes.</p>
          <p className="mt-2 text-sm text-red-800">{error}</p>
        </Card>
      )}

      {!loading && !error && (
        <>
          <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
            <MetricCard title="Valores críticos" value={criticalCount} icon={AlertTriangle} tone="red" />
            <MetricCard title="Requer atenção" value={attentionCount} icon={AlertTriangle} tone="amber" />
            <MetricCard title="Dentro da normalidade" value={normalCount} icon={CheckCircle} tone="green" />
          </div>

          {!patientMode && (
          <Card className="mb-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            {patients.length === 0 ? (
              <p className="text-sm text-slate-600">Nenhuma paciente cadastrada para seleção.</p>
            ) : (
              <div className="flex flex-col gap-3 md:flex-row md:items-center">
                <p className="text-sm font-medium text-slate-700">Paciente:</p>
                <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                  <SelectTrigger className="w-full rounded-lg md:w-80">
                    <SelectValue placeholder="Selecione uma paciente" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </Card>
          )}

          {examsLoading && (
            <Card className="mb-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-600">Carregando resultados de exames...</p>
            </Card>
          )}

          {!examsLoading && examsUnavailable && (
            <Card className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-6 shadow-sm">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 size-5 text-amber-700" />
                <div>
                  <p className="font-semibold text-amber-950">Tabela de exames ainda não criada no Supabase.</p>
                  <p className="mt-2 text-sm text-slate-700">
                    Execute o arquivo supabase-scenarios.sql para criar paciente_exames e carregar os cenários com exames.
                  </p>
                </div>
              </div>
            </Card>
          )}

          {!examsLoading && !examsUnavailable && patientExams.length === 0 && (
            <Card className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-6 shadow-sm">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-0.5 size-5 text-amber-700" />
                <div>
                  <p className="font-semibold text-amber-950">Nenhum resultado de exame registrado.</p>
                  <p className="mt-2 text-sm text-slate-700">
                    {selectedPatientName
                      ? `A paciente ${selectedPatientName} ainda não possui resultados laboratoriais registrados.`
                      : 'Selecione uma paciente para consultar os resultados laboratoriais.'}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {!examsLoading && !examsUnavailable && patientExams.length > 0 && (
            <Card className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 p-6 shadow-sm">
              <p className="font-semibold text-emerald-950">Resultados laboratoriais carregados.</p>
              <p className="mt-2 text-sm text-slate-700">
                {selectedPatientName} possui {patientExams.length} resultado(s) registrado(s).
              </p>
            </Card>
          )}

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
            <div className="lg:col-span-1">
              <Card className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                <p className="mb-3 text-sm font-semibold text-slate-950">Categorias</p>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`flex w-full items-center gap-3 rounded-lg p-3 text-left text-sm font-medium transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-cyan-700 text-white'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <category.icon className="size-5" />
                      {category.name}
                    </button>
                  ))}
                </div>
              </Card>
            </div>

            <div className="lg:col-span-3">
              <Card className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-slate-950">{currentCategoryName}</h3>
                  {selectedCategory !== 'bioimpedancia' && (
                    <p className="mt-1 text-xs text-slate-500">{referenceContextText}</p>
                  )}
                </div>

                {selectedCategory === 'bioimpedancia' && bioimpedancia ? (
                  <div>
                    <p className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
                      Última avaliação: {formatDate(bioimpedancia.data_avaliacao)}
                    </p>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                      <BioInfo label="Peso" value={`${formatNumber(bioimpedancia.peso)} kg`} />
                      <BioInfo label="Altura" value={`${formatNumber(bioimpedancia.altura, 2)} m`} />
                      <BioInfo label="IMC" value={formatNumber(imc)} />
                      <BioInfo label="Massa magra" value={`${formatNumber(bioimpedancia.massa_magra)} kg`} />
                      <BioInfo label="Massa gorda" value={`${formatNumber(bioimpedancia.massa_gorda)} %`} />
                      <BioInfo label="Água corporal" value={`${formatNumber(bioimpedancia.agua_corporal)} %`} />
                      <BioInfo label="Ângulo de fase" value={`${formatNumber(bioimpedancia.angulo_fase)} graus`} />
                    </div>
                  </div>
                ) : selectedCategory === 'bioimpedancia' ? (
                  <p className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                    Nenhuma bioimpedância registrada para esta paciente.
                  </p>
                ) : currentExams.length > 0 ? (
                  <div className="mb-6 overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Exame</TableHead>
                          <TableHead>Valor</TableHead>
                          <TableHead>Referência</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentExams.map((exam) => (
                          <TableRow key={`${selectedCategory}-${exam.name}`}>
                            <TableCell className="font-medium">{exam.name}</TableCell>
                            <TableCell>
                              {exam.value} {exam.unit}
                            </TableCell>
                            <TableCell>{exam.reference}</TableCell>
                            <TableCell>
                              <Badge className={`w-fit ${getStatusColor(exam.status)}`}>
                                {getStatusText(exam.status)}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <p className="mb-6 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                    Nenhum resultado registrado nesta categoria.
                  </p>
                )}

                {selectedCategory !== 'bioimpedancia' && (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Exame</TableHead>
                        <TableHead>Referência</TableHead>
                        <TableHead>Unidade</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {referenceRows.map((exam) => (
                        <TableRow key={exam.name}>
                          <TableCell className="font-medium">{exam.name}</TableCell>
                          <TableCell>{exam.reference}</TableCell>
                          <TableCell>{exam.unit}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                )}
              </Card>
            </div>
          </div>
        </>
      )}

      <Outlet />
    </>
  );
}

function MetricCard({
  title,
  value,
  icon: Icon,
  tone,
}: {
  title: string;
  value: number;
  icon: typeof AlertTriangle;
  tone: 'red' | 'amber' | 'green';
}) {
  const tones = {
    red: 'bg-red-50 text-red-700',
    amber: 'bg-amber-50 text-amber-700',
    green: 'bg-green-50 text-green-700',
  };

  return (
    <Card className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-4">
        <div className={`flex size-11 items-center justify-center rounded-lg ${tones[tone]}`}>
          <Icon className="size-5" />
        </div>
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <p className="mt-1 text-2xl font-bold text-slate-950">{value}</p>
        </div>
      </div>
    </Card>
  );
}

function BioInfo({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-medium uppercase text-slate-500">{label}</p>
      <p className="mt-2 text-xl font-bold text-slate-950">{value}</p>
    </div>
  );
}
