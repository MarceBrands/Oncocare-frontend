import { useEffect, useMemo, useState } from 'react';
import { Outlet } from 'react-router';
import {
  AlertTriangle,
  Brain,
  CalendarDays,
  ClipboardCheck,
  HeartPulse,
  Save,
  ShieldCheck,
} from 'lucide-react';
import { Card } from '../components/ui/card';
import { Slider } from '../components/ui/slider';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Checkbox } from '../components/ui/checkbox';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { supabase, type PacienteRow } from '../../lib/supabase';

type Question =
  | {
      id: string;
      type: 'scale';
      label: string;
      max: 10 | 4;
      help?: string;
    }
  | {
      id: string;
      type: 'choice';
      label: string;
      options: string[];
    }
  | {
      id: string;
      type: 'multi';
      label: string;
      options: string[];
      alertOptions?: string[];
    }
  | {
      id: string;
      type: 'matrix';
      label: string;
      help: string;
      items: string[];
    }
  | {
      id: string;
      type: 'inputs';
      label: string;
      items: string[];
    };

type Block = {
  title: string;
  questions: Question[];
};

type Questionnaire = {
  id: 'mama' | 'colo_utero';
  title: string;
  description: string;
  treatments: string[];
  blocks: Block[];
};

const questionnaires: Questionnaire[] = [
  {
    id: 'mama',
    title: 'Cancer de mama',
    description: 'Check-in semanal para funcao fisica, fadiga, dor, sono, saude emocional e continuidade do cuidado.',
    treatments: ['Cirurgia', 'Quimioterapia', 'Radioterapia', 'Hormonioterapia', 'Imunoterapia'],
    blocks: [
      {
        title: 'Estado geral',
        questions: [
          { id: 'mama_saude_hoje', type: 'scale', label: 'Como voce avaliaria sua saude hoje?', max: 10 },
          { id: 'mama_qv_semana', type: 'scale', label: 'Como voce avaliaria sua qualidade de vida nesta semana?', max: 10 },
          {
            id: 'mama_piora',
            type: 'choice',
            label: 'Voce percebeu piora do seu estado geral nos ultimos 7 dias?',
            options: ['Nao', 'Leve piora', 'Moderada piora', 'Grande piora'],
          },
        ],
      },
      {
        title: 'Funcionalidade',
        questions: [
          {
            id: 'mama_atividades',
            type: 'choice',
            label: 'Voce conseguiu realizar suas atividades habituais?',
            options: ['Sem dificuldade', 'Com pouca dificuldade', 'Com dificuldade moderada', 'Com muita dificuldade', 'Nao consegui realizar'],
          },
          {
            id: 'mama_dificuldades',
            type: 'matrix',
            label: 'Voce apresentou dificuldade para:',
            help: '0 = nenhuma | 4 = incapacitante',
            items: ['Caminhar', 'Subir escadas', 'Levantar objetos', 'Tomar banho', 'Vestir-se'],
          },
          { id: 'mama_fadiga', type: 'scale', label: 'Quanto cansaco/fadiga voce sentiu?', max: 10 },
          {
            id: 'mama_fadiga_rotina',
            type: 'choice',
            label: 'O cansaco prejudicou sua rotina?',
            options: ['Nao', 'Pouco', 'Moderadamente', 'Muito', 'Totalmente'],
          },
        ],
      },
      {
        title: 'Dor e sintomas',
        questions: [
          { id: 'mama_dor', type: 'scale', label: 'Qual intensidade da dor hoje?', max: 10 },
          {
            id: 'mama_local_dor',
            type: 'multi',
            label: 'Onde esta localizada a dor?',
            options: ['Mama', 'Axila', 'Braco', 'Ombro', 'Coluna', 'Outro'],
          },
          {
            id: 'mama_interferencia_dor',
            type: 'matrix',
            label: 'A dor interferiu:',
            help: '0 = nao | 4 = muito',
            items: ['No sono', 'Na alimentacao', 'Na movimentacao', 'No humor'],
          },
        ],
      },
      {
        title: 'Sintomas especificos pos-mama',
        questions: [
          {
            id: 'mama_sintomas_especificos',
            type: 'matrix',
            label: 'Voce percebeu:',
            help: '0 = nao | 4 = intenso',
            items: ['Inchaco no braco', 'Sensacao de peso no braco', 'Limitacao de movimento', 'Dormencia/formigamento', 'Sensibilidade local', 'Rigidez muscular'],
          },
          {
            id: 'mama_levantar_braco',
            type: 'choice',
            label: 'Voce sente dificuldade para levantar o braco?',
            options: ['Nao', 'Leve', 'Moderada', 'Grave'],
          },
        ],
      },
      {
        title: 'Nutricao e composicao corporal',
        questions: [
          {
            id: 'mama_perda_peso',
            type: 'choice',
            label: 'Voce perdeu peso recentemente?',
            options: ['Nao', 'Ate 2 kg', '2-5 kg', 'Mais de 5 kg'],
          },
          {
            id: 'mama_apetite',
            type: 'choice',
            label: 'Como esteve seu apetite?',
            options: ['Normal', 'Levemente reduzido', 'Moderadamente reduzido', 'Muito reduzido'],
          },
          {
            id: 'mama_gastro',
            type: 'matrix',
            label: 'Voce teve:',
            help: '0 = nao | 4 = intenso',
            items: ['Nausea', 'Vomitos', 'Diarreia', 'Constipacao', 'Dificuldade para comer'],
          },
          {
            id: 'mama_bio',
            type: 'inputs',
            label: 'Dados de bioimpedancia',
            items: ['Peso', 'Massa magra', 'Massa gorda', 'Agua corporal', 'IMC', 'Angulo de fase opcional'],
          },
        ],
      },
      {
        title: 'Sono e saude mental',
        questions: [
          {
            id: 'mama_sono',
            type: 'choice',
            label: 'Como foi seu sono nesta semana?',
            options: ['Muito bom', 'Bom', 'Regular', 'Ruim', 'Muito ruim'],
          },
          {
            id: 'mama_mental',
            type: 'matrix',
            label: 'Voce apresentou:',
            help: '0 = nao | 4 = intenso',
            items: ['Ansiedade', 'Tristeza', 'Medo da doenca voltar', 'Desanimo', 'Irritabilidade'],
          },
        ],
      },
      {
        title: 'Adesao e continuidade do cuidado',
        questions: [
          {
            id: 'mama_medicacoes',
            type: 'choice',
            label: 'Voce tomou corretamente suas medicacoes?',
            options: ['Sim', 'Parcialmente', 'Nao'],
          },
          {
            id: 'mama_faltas',
            type: 'choice',
            label: 'Voce deixou de comparecer a consultas/exames?',
            options: ['Nao', 'Sim'],
          },
          {
            id: 'mama_ajuda',
            type: 'choice',
            label: 'Voce sente necessidade de ajuda profissional neste momento?',
            options: ['Nao', 'Sim'],
          },
        ],
      },
      {
        title: 'Alerta clinico',
        questions: [
          {
            id: 'mama_alertas',
            type: 'multi',
            label: 'Voce apresentou algum destes sinais?',
            options: ['Febre', 'Falta de ar', 'Dor intensa', 'Vermelhidao importante', 'Edema importante', 'Desmaio', 'Sangramento', 'Nenhum'],
            alertOptions: ['Febre', 'Falta de ar', 'Dor intensa', 'Vermelhidao importante', 'Edema importante', 'Desmaio', 'Sangramento'],
          },
        ],
      },
    ],
  },
  {
    id: 'colo_utero',
    title: 'Cancer de colo do utero',
    description: 'Check-in semanal para funcionalidade, dor pelvica, sintomas urinarios, gastrointestinais, saude sexual e alertas clinicos.',
    treatments: ['Cirurgia', 'Radioterapia', 'Braquiterapia', 'Quimioterapia', 'Imunoterapia'],
    blocks: [
      {
        title: 'Estado geral',
        questions: [
          { id: 'colo_saude_hoje', type: 'scale', label: 'Como voce avaliaria sua saude hoje?', max: 10 },
          { id: 'colo_qv_semana', type: 'scale', label: 'Como voce avaliaria sua qualidade de vida nesta semana?', max: 10 },
          {
            id: 'colo_piora',
            type: 'choice',
            label: 'Voce percebeu piora do seu estado geral nos ultimos dias?',
            options: ['Nao', 'Leve', 'Moderada', 'Importante'],
          },
        ],
      },
      {
        title: 'Funcionalidade e fadiga',
        questions: [
          {
            id: 'colo_atividades',
            type: 'choice',
            label: 'Voce conseguiu realizar suas atividades habituais?',
            options: ['Sem dificuldade', 'Pouca dificuldade', 'Dificuldade moderada', 'Grande dificuldade', 'Nao consegui realizar'],
          },
          { id: 'colo_fadiga', type: 'scale', label: 'Quanto cansaco/fadiga voce sentiu?', max: 10 },
          {
            id: 'colo_fadiga_interferencia',
            type: 'matrix',
            label: 'O cansaco interferiu:',
            help: '0 = nao | 4 = muito',
            items: ['Nas tarefas domesticas', 'Na mobilidade', 'No autocuidado', 'Na disposicao diaria'],
          },
        ],
      },
      {
        title: 'Dor e sintomas pelvicos',
        questions: [
          { id: 'colo_dor', type: 'scale', label: 'Qual intensidade da dor hoje?', max: 10 },
          {
            id: 'colo_local_dor',
            type: 'multi',
            label: 'Onde esta localizada a dor?',
            options: ['Pelvis', 'Abdome', 'Lombar', 'Regiao intima', 'Pernas', 'Outro'],
          },
          {
            id: 'colo_sintomas_pelvicos',
            type: 'matrix',
            label: 'Voce apresentou:',
            help: '0 = nao | 4 = intenso',
            items: ['Dor pelvica', 'Sensacao de pressao', 'Colicas', 'Queimacao', 'Desconforto ao sentar'],
          },
        ],
      },
      {
        title: 'Sintomas urinarios',
        questions: [
          {
            id: 'colo_urinarios',
            type: 'matrix',
            label: 'Voce percebeu:',
            help: '0 = nao | 4 = intenso',
            items: ['Ardencia ao urinar', 'Urgencia urinaria', 'Aumento da frequencia urinaria', 'Incontinencia urinaria', 'Dificuldade para urinar', 'Sangramento urinario'],
          },
        ],
      },
      {
        title: 'Sintomas gastrointestinais',
        questions: [
          {
            id: 'colo_gastro',
            type: 'matrix',
            label: 'Voce apresentou:',
            help: '0 = nao | 4 = intenso',
            items: ['Diarreia', 'Constipacao', 'Nausea', 'Dor abdominal', 'Distensao abdominal', 'Sangramento intestinal'],
          },
          {
            id: 'colo_apetite',
            type: 'choice',
            label: 'Seu apetite esteve:',
            options: ['Normal', 'Levemente reduzido', 'Moderadamente reduzido', 'Muito reduzido'],
          },
        ],
      },
      {
        title: 'Nutricao e composicao corporal',
        questions: [
          {
            id: 'colo_perda_peso',
            type: 'choice',
            label: 'Voce perdeu peso recentemente?',
            options: ['Nao', 'Ate 2 kg', '2-5 kg', 'Mais de 5 kg'],
          },
          {
            id: 'colo_nutricao',
            type: 'matrix',
            label: 'Voce percebeu:',
            help: '0 = nao | 4 = intenso',
            items: ['Fraqueza muscular', 'Perda de forca', 'Dificuldade para se alimentar', 'Reducao importante do apetite'],
          },
          {
            id: 'colo_bio',
            type: 'inputs',
            label: 'Dados de bioimpedancia',
            items: ['Peso', 'Massa magra', 'Massa gorda', 'Agua corporal', 'IMC', 'Angulo de fase opcional'],
          },
        ],
      },
      {
        title: 'Saude sexual e ginecologica',
        questions: [
          {
            id: 'colo_sexual',
            type: 'matrix',
            label: 'Voce apresentou:',
            help: '0 = nao | 4 = intenso',
            items: ['Dor durante relacao', 'Ressecamento vaginal', 'Desconforto intimo', 'Sangramento vaginal', 'Reducao da libido'],
          },
          {
            id: 'colo_autoestima',
            type: 'choice',
            label: 'O tratamento impactou sua autoestima ou imagem corporal?',
            options: ['Nao', 'Pouco', 'Moderadamente', 'Muito'],
          },
        ],
      },
      {
        title: 'Saude mental',
        questions: [
          {
            id: 'colo_mental',
            type: 'matrix',
            label: 'Voce apresentou:',
            help: '0 = nao | 4 = intenso',
            items: ['Ansiedade', 'Tristeza', 'Medo da doenca voltar', 'Sensacao de isolamento', 'Desanimo'],
          },
        ],
      },
      {
        title: 'Continuidade do cuidado',
        questions: [
          {
            id: 'colo_consultas',
            type: 'choice',
            label: 'Voce conseguiu comparecer as consultas?',
            options: ['Sim', 'Parcialmente', 'Nao'],
          },
          {
            id: 'colo_ajuda',
            type: 'choice',
            label: 'Voce sente necessidade de ajuda profissional neste momento?',
            options: ['Nao', 'Sim'],
          },
        ],
      },
      {
        title: 'Alerta clinico',
        questions: [
          {
            id: 'colo_alertas',
            type: 'multi',
            label: 'Voce apresentou:',
            options: ['Febre', 'Sangramento importante', 'Dor intensa', 'Falta de ar', 'Dificuldade para urinar', 'Sangramento urinario/intestinal', 'Fraqueza intensa', 'Nenhum'],
            alertOptions: ['Febre', 'Sangramento importante', 'Dor intensa', 'Falta de ar', 'Dificuldade para urinar', 'Sangramento urinario/intestinal', 'Fraqueza intensa'],
          },
        ],
      },
    ],
  },
];

type Answers = Record<string, number | string | string[] | Record<string, number | string>>;

function getChoiceScore(question: Question, value: string) {
  if (question.type !== 'choice') return 0;
  return Math.max(0, question.options.indexOf(value));
}

function getQuestionnaire(id: string) {
  return questionnaires.find((questionnaire) => questionnaire.id === id) ?? questionnaires[0];
}

function getQuestionCount(questionnaire: Questionnaire) {
  return questionnaire.blocks.reduce((total, block) => total + block.questions.length, 0);
}

function getSelectedAlerts(questionnaire: Questionnaire, answers: Answers) {
  const alerts: string[] = [];

  questionnaire.blocks.forEach((block) => {
    block.questions.forEach((question) => {
      if (question.type !== 'multi' || !question.alertOptions) return;

      const selected = answers[question.id];
      if (!Array.isArray(selected)) return;

      selected.forEach((item) => {
        if (question.alertOptions?.includes(item)) {
          alerts.push(item);
        }
      });
    });
  });

  return alerts;
}

function getTotalScore(questionnaire: Questionnaire, answers: Answers) {
  let total = 0;

  questionnaire.blocks.forEach((block) => {
    block.questions.forEach((question) => {
      const value = answers[question.id];

      if (typeof value === 'number') {
        total += value;
      }

      if (typeof value === 'string') {
        total += getChoiceScore(question, value);
      }

      if (value && typeof value === 'object' && !Array.isArray(value)) {
        total += Object.values(value).reduce(
          (sum, item) => sum + (typeof item === 'number' ? item : 0),
          0
        );
      }
    });
  });

  return total;
}

export function Sintomas() {
  const [selectedQuestionnaire, setSelectedQuestionnaire] = useState<Questionnaire['id']>('mama');
  const [selectedPatient, setSelectedPatient] = useState('');
  const [patientSearch, setPatientSearch] = useState('');
  const [patients, setPatients] = useState<PacienteRow[]>([]);
  const [answers, setAnswers] = useState<Answers>({});
  const [selectedTreatments, setSelectedTreatments] = useState<string[]>([]);
  const [savedMessage, setSavedMessage] = useState('');
  const [saveError, setSaveError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const questionnaire = getQuestionnaire(selectedQuestionnaire);
  const totalScore = useMemo(() => getTotalScore(questionnaire, answers), [questionnaire, answers]);
  const alerts = useMemo(() => getSelectedAlerts(questionnaire, answers), [questionnaire, answers]);
  const answeredCount = Object.keys(answers).length;
  const canAnswer = Boolean(selectedPatient);
  const filteredPatientOptions = useMemo(() => {
    const term = patientSearch.trim().toLowerCase();

    if (!term) {
      return patients.slice(0, 6);
    }

    return patients
      .filter((patient) => {
        return (
          patient.nome.toLowerCase().includes(term) ||
          patient.cpf.toLowerCase().includes(term)
        );
      })
      .slice(0, 6);
  }, [patients, patientSearch]);

  useEffect(() => {
    async function loadPatients() {
      const { data } = await supabase.from('pacientes').select('*').order('nome');
      setPatients((data ?? []) as PacienteRow[]);
    }

    loadPatients();
  }, []);

  function resetQuestionnaire(id: Questionnaire['id']) {
    setSelectedQuestionnaire(id);
    setAnswers({});
    setSelectedTreatments([]);
    setSavedMessage('');
    setSaveError('');
  }

  function selectPatient(patient: PacienteRow) {
    setSelectedPatient(patient.id);
    setPatientSearch(patient.nome);
    setAnswers({});
    setSelectedTreatments([]);
    setSavedMessage('');
    setSaveError('');
  }

  function setAnswer(id: string, value: Answers[string]) {
    if (!canAnswer) {
      setSaveError('Selecione uma paciente antes de preencher as respostas.');
      return;
    }

    setAnswers((current) => ({ ...current, [id]: value }));
    setSavedMessage('');
    setSaveError('');
  }

  function toggleTreatment(treatment: string, checked: boolean) {
    if (!canAnswer) {
      setSaveError('Selecione uma paciente antes de marcar tratamentos.');
      return;
    }

    setSelectedTreatments((current) =>
      checked ? [...current, treatment] : current.filter((item) => item !== treatment)
    );
    setSavedMessage('');
    setSaveError('');
  }

  function toggleMultiAnswer(questionId: string, option: string, checked: boolean) {
    if (!canAnswer) {
      setSaveError('Selecione uma paciente antes de preencher as respostas.');
      return;
    }

    const current = answers[questionId];
    const selected = Array.isArray(current) ? current : [];

    if (option === 'Nenhum' && checked) {
      setAnswer(questionId, ['Nenhum']);
      return;
    }

    const withoutNone = selected.filter((item) => item !== 'Nenhum');
    const next = checked
      ? [...withoutNone, option]
      : withoutNone.filter((item) => item !== option);

    setAnswer(questionId, next);
  }

  function setMatrixAnswer(questionId: string, item: string, value: number) {
    if (!canAnswer) {
      setSaveError('Selecione uma paciente antes de preencher as respostas.');
      return;
    }

    const current = answers[questionId];
    const matrix = current && typeof current === 'object' && !Array.isArray(current) ? current : {};
    setAnswer(questionId, { ...matrix, [item]: value });
  }

  function setInputAnswer(questionId: string, item: string, value: string) {
    if (!canAnswer) {
      setSaveError('Selecione uma paciente antes de preencher as respostas.');
      return;
    }

    const current = answers[questionId];
    const inputValues = current && typeof current === 'object' && !Array.isArray(current) ? current : {};
    setAnswer(questionId, { ...inputValues, [item]: value });
  }

  async function ensureQuestionario() {
    const { data: existing, error: existingError } = await supabase
      .from('questionarios')
      .select('id')
      .eq('titulo', questionnaire.title)
      .eq('tipo_cancer', questionnaire.id)
      .maybeSingle();

    if (existingError) {
      throw existingError;
    }

    if (existing) {
      return existing.id as string;
    }

    const { data: created, error: createError } = await supabase
      .from('questionarios')
      .insert({
        titulo: questionnaire.title,
        descricao: questionnaire.description,
        tipo_cancer: questionnaire.id,
        ativo: true,
      })
      .select('id')
      .single();

    if (createError || !created) {
      throw createError ?? new Error('Nao foi possivel criar o questionario.');
    }

    return created.id as string;
  }

  async function ensurePergunta(questionarioId: string, texto: string, tipoResposta: string, ordem: number) {
    const { data: existing, error: existingError } = await supabase
      .from('perguntas_questionario')
      .select('id')
      .eq('questionario_id', questionarioId)
      .eq('texto', texto)
      .maybeSingle();

    if (existingError) {
      throw existingError;
    }

    if (existing) {
      return existing.id as string;
    }

    const { data: created, error: createError } = await supabase
      .from('perguntas_questionario')
      .insert({
        questionario_id: questionarioId,
        texto,
        tipo_resposta: tipoResposta,
        ordem,
        obrigatoria: false,
      })
      .select('id')
      .single();

    if (createError || !created) {
      throw createError ?? new Error('Nao foi possivel criar uma pergunta.');
    }

    return created.id as string;
  }

  function flattenAnswers() {
    let order = 1;
    const rows: Array<{
      texto: string;
      tipoResposta: string;
      respostaTexto?: string;
      respostaNumero?: number;
      respostaBooleano?: boolean;
      ordem: number;
    }> = [];

    questionnaire.blocks.forEach((block) => {
      block.questions.forEach((question) => {
        const value = answers[question.id];

        if (value === undefined) {
          order += 1;
          return;
        }

        if (question.type === 'scale' && typeof value === 'number') {
          rows.push({
            texto: `${block.title} - ${question.label}`,
            tipoResposta: 'escala',
            respostaNumero: value,
            ordem: order,
          });
        }

        if (question.type === 'choice' && typeof value === 'string') {
          rows.push({
            texto: `${block.title} - ${question.label}`,
            tipoResposta: 'opcao_unica',
            respostaTexto: value,
            respostaNumero: getChoiceScore(question, value),
            ordem: order,
          });
        }

        if (question.type === 'multi' && Array.isArray(value)) {
          rows.push({
            texto: `${block.title} - ${question.label}`,
            tipoResposta: 'multipla_escolha',
            respostaTexto: value.join(', '),
            ordem: order,
          });
        }

        if ((question.type === 'matrix' || question.type === 'inputs') && value && typeof value === 'object' && !Array.isArray(value)) {
          Object.entries(value).forEach(([item, itemValue], itemIndex) => {
            rows.push({
              texto: `${block.title} - ${question.label} - ${item}`,
              tipoResposta: question.type === 'matrix' ? 'escala_0_4' : 'valor_livre',
              respostaTexto: typeof itemValue === 'string' ? itemValue : undefined,
              respostaNumero: typeof itemValue === 'number' ? itemValue : undefined,
              ordem: order + itemIndex / 100,
            });
          });
        }

        order += 1;
      });
    });

    selectedTreatments.forEach((treatment, index) => {
      rows.push({
        texto: `Identificacao - Tratamento realizado - ${treatment}`,
        tipoResposta: 'booleano',
        respostaBooleano: true,
        ordem: 1000 + index,
      });
    });

    return rows;
  }

  async function handleSave() {
    setSavedMessage('');
    setSaveError('');

    if (!selectedPatient) {
      setSaveError('Selecione uma paciente antes de registrar a avaliacao.');
      return;
    }

    const responseRows = flattenAnswers();

    if (responseRows.length === 0) {
      setSaveError('Responda pelo menos uma pergunta antes de registrar a avaliacao.');
      return;
    }

    setIsSaving(true);

    try {
      const questionarioId = await ensureQuestionario();

      const { data: responseHeader, error: responseHeaderError } = await supabase
        .from('respostas_questionario_paciente')
        .insert({
          paciente_id: selectedPatient,
          questionario_id: questionarioId,
          pontuacao_total: totalScore,
          classificacao_risco: alerts.length > 0 ? 'alerta_clinico' : 'sem_alerta',
          observacao:
            alerts.length > 0
              ? `Alertas selecionados: ${alerts.join(', ')}`
              : 'Sem alertas clinicos selecionados.',
        })
        .select('id')
        .single();

      if (responseHeaderError || !responseHeader) {
        throw responseHeaderError ?? new Error('Nao foi possivel registrar a avaliacao.');
      }

      const questionIds = await Promise.all(
        responseRows.map((row) =>
          ensurePergunta(questionarioId, row.texto, row.tipoResposta, Math.round(row.ordem * 100))
        )
      );

      const { error: answersError } = await supabase.from('respostas_paciente').insert(
        responseRows.map((row, index) => ({
          resposta_questionario_id: responseHeader.id,
          pergunta_id: questionIds[index],
          resposta_texto: row.respostaTexto ?? null,
          resposta_numero: row.respostaNumero ?? null,
          resposta_booleano: row.respostaBooleano ?? null,
        }))
      );

      if (answersError) {
        throw answersError;
      }

      setSavedMessage('Avaliacao registrada no Supabase com sucesso.');
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Erro ao salvar avaliacao.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <div className="mb-8">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-950">Avaliacoes</h1>
            <p className="text-slate-600 mt-2 max-w-3xl">
              Check-ins semanais por tipo de cancer, com sinais de alerta, sintomas e continuidade do cuidado.
            </p>
          </div>
          <Badge className="w-fit bg-cyan-50 text-cyan-800 border border-cyan-200">
            {getQuestionCount(questionnaire)} perguntas
          </Badge>
        </div>
      </div>

      <Tabs value={selectedQuestionnaire} onValueChange={(value) => resetQuestionnaire(value as Questionnaire['id'])}>
        <TabsList className="mb-6 h-auto w-full justify-start rounded-lg bg-slate-100 p-1">
          <TabsTrigger value="mama" className="rounded-md px-4 py-2">
            Cancer de mama
          </TabsTrigger>
          <TabsTrigger value="colo_utero" className="rounded-md px-4 py-2">
            Cancer de colo do utero
          </TabsTrigger>
        </TabsList>

        {questionnaires.map((item) => (
          <TabsContent key={item.id} value={item.id} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
              <div className="space-y-6">
                <Card className="p-5 bg-white border border-slate-200 shadow-sm rounded-lg">
                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                    <div>
                      <Label>Data</Label>
                      <Input type="date" defaultValue={new Date().toISOString().slice(0, 10)} className="mt-2 rounded-lg" />
                    </div>
                    <div>
                      <Label>Paciente</Label>
                      <div className="relative mt-2">
                        <Input
                          value={patientSearch}
                          onChange={(event) => {
                            setPatientSearch(event.target.value);
                            setSelectedPatient('');
                            setSaveError('');
                          }}
                          placeholder="Digite o nome ou CPF da paciente"
                          className="rounded-lg"
                        />
                        {patientSearch && !selectedPatient && (
                          <div className="absolute z-20 mt-2 max-h-56 w-full overflow-auto rounded-lg border border-slate-200 bg-white p-1 shadow-lg">
                            {filteredPatientOptions.length === 0 ? (
                              <p className="px-3 py-2 text-sm text-slate-500">Nenhuma paciente encontrada.</p>
                            ) : (
                              filteredPatientOptions.map((patient) => (
                                <button
                                  key={patient.id}
                                  type="button"
                                  onClick={() => selectPatient(patient)}
                                  className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-slate-100"
                                >
                                  <span className="font-medium text-slate-950">{patient.nome}</span>
                                  <span className="block text-xs text-slate-500">{patient.cpf}</span>
                                </button>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <Label>Tempo desde termino do tratamento</Label>
                      <Input disabled={!canAnswer} placeholder="Ex: 3 meses" className="mt-2 rounded-lg" />
                    </div>
                  </div>

                  <div className="mt-5">
                    <Label>Tratamentos realizados</Label>
                    <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                      {item.treatments.map((treatment) => (
                        <label
                          key={treatment}
                          className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 text-sm text-slate-700"
                        >
                          <Checkbox
                            disabled={!canAnswer}
                            checked={selectedTreatments.includes(treatment)}
                            onCheckedChange={(checked) => toggleTreatment(treatment, checked as boolean)}
                          />
                          {treatment}
                        </label>
                      ))}
                    </div>
                  </div>
                </Card>

                {!canAnswer && (
                  <Card className="rounded-lg border border-amber-200 bg-amber-50 p-4 shadow-sm">
                    <p className="font-semibold text-amber-950">Selecione uma paciente para preencher.</p>
                    <p className="mt-1 text-sm text-amber-800">
                      Assim o sistema sabe em qual prontuario salvar as respostas.
                    </p>
                  </Card>
                )}

                {item.blocks.map((block) => (
                  <Card key={block.title} className="p-5 bg-white border border-slate-200 shadow-sm rounded-lg">
                    <h2 className="text-lg font-semibold text-slate-950">{block.title}</h2>
                    <div className="mt-5 space-y-6">
                      {block.questions.map((question) => (
                        <QuestionField
                          key={question.id}
                          question={question}
                          value={answers[question.id]}
                          onAnswer={setAnswer}
                          onMultiAnswer={toggleMultiAnswer}
                          onMatrixAnswer={setMatrixAnswer}
                          onInputAnswer={setInputAnswer}
                          disabled={!canAnswer}
                        />
                      ))}
                    </div>
                  </Card>
                ))}

                <Card className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="font-semibold text-slate-950">Finalizar este questionario</p>
                      <p className="text-sm text-slate-600">
                        Cada salvamento cria um novo registro com data, para acompanhar a evolucao.
                      </p>
                    </div>
                    <Button
                      onClick={handleSave}
                      disabled={isSaving || !canAnswer}
                      className="bg-cyan-700 hover:bg-cyan-800 rounded-lg"
                    >
                      <Save className="size-4 mr-2" />
                      {isSaving ? 'Salvando...' : 'Salvar questionario'}
                    </Button>
                  </div>
                </Card>
              </div>

              <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
                <Card className="p-5 bg-white border border-slate-200 shadow-sm rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-lg bg-cyan-700 flex items-center justify-center">
                      <ClipboardCheck className="size-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-950">{item.title}</p>
                      <p className="text-xs text-slate-500">Check-in semanal</p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-slate-600">{item.description}</p>
                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <SummaryTile label="Respondidas" value={`${answeredCount}`} />
                    <SummaryTile label="Score bruto" value={`${totalScore}`} />
                  </div>
                </Card>

                <Card className="p-5 bg-white border border-slate-200 shadow-sm rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className={alerts.length > 0 ? 'size-5 text-red-700' : 'size-5 text-emerald-700'} />
                    <h3 className="font-semibold text-slate-950">Alertas clinicos</h3>
                  </div>
                  {alerts.length === 0 ? (
                    <p className="mt-3 text-sm text-slate-600">Nenhum alerta selecionado ate agora.</p>
                  ) : (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {alerts.map((alert) => (
                        <Badge key={alert} variant="destructive">
                          {alert}
                        </Badge>
                      ))}
                    </div>
                  )}
                </Card>

                <Card className="p-5 bg-white border border-slate-200 shadow-sm rounded-lg">
                  <div className="space-y-3 text-sm text-slate-600">
                    <p className="flex gap-2">
                      <ShieldCheck className="mt-0.5 size-4 text-cyan-700" />
                      Use este check-in para acompanhamento clinico; ele nao substitui avaliacao medica.
                    </p>
                    <p className="flex gap-2">
                      <CalendarDays className="mt-0.5 size-4 text-slate-500" />
                      Recomendado para preenchimento semanal.
                    </p>
                  </div>
                  <Button
                    onClick={handleSave}
                    disabled={isSaving || !canAnswer}
                    className="mt-5 w-full bg-cyan-700 hover:bg-cyan-800 rounded-lg"
                  >
                    <Save className="size-4 mr-2" />
                    {isSaving ? 'Registrando...' : 'Registrar avaliacao'}
                  </Button>
                  {saveError && (
                    <p className="mt-3 rounded-lg bg-red-50 p-3 text-xs text-red-800">{saveError}</p>
                  )}
                  {savedMessage && (
                    <p className="mt-3 rounded-lg bg-cyan-50 p-3 text-xs text-cyan-800">{savedMessage}</p>
                  )}
                </Card>
              </aside>
            </div>
          </TabsContent>
        ))}
      </Tabs>

      <Outlet />
    </>
  );
}

function SummaryTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-xl font-bold text-slate-950">{value}</p>
    </div>
  );
}

function QuestionField({
  question,
  value,
  onAnswer,
  onMultiAnswer,
  onMatrixAnswer,
  onInputAnswer,
  disabled,
}: {
  question: Question;
  value: Answers[string];
  onAnswer: (id: string, value: Answers[string]) => void;
  onMultiAnswer: (questionId: string, option: string, checked: boolean) => void;
  onMatrixAnswer: (questionId: string, item: string, value: number) => void;
  onInputAnswer: (questionId: string, item: string, value: string) => void;
  disabled: boolean;
}) {
  return (
    <div className={`rounded-lg border border-slate-200 p-4 ${disabled ? 'bg-slate-50 opacity-75' : ''}`}>
      <div className="mb-4 flex items-start gap-3">
        <HeartPulse className="mt-0.5 size-5 text-cyan-700" />
        <div>
          <p className="font-medium text-slate-950">{question.label}</p>
          {'help' in question && question.help && (
            <p className="mt-1 text-xs text-slate-500">{question.help}</p>
          )}
        </div>
      </div>

      {question.type === 'scale' && (
        <div>
          <div className="mb-3 flex items-center justify-between text-sm">
            <span className="text-slate-500">0</span>
            <span className="rounded-md bg-slate-100 px-2 py-1 font-semibold text-slate-900">
              {typeof value === 'number' ? value : 0}/{question.max}
            </span>
            <span className="text-slate-500">{question.max}</span>
          </div>
          <Slider
            disabled={disabled}
            value={[typeof value === 'number' ? value : 0]}
            onValueChange={(next) => onAnswer(question.id, next[0])}
            max={question.max}
            step={1}
          />
        </div>
      )}

      {question.type === 'choice' && (
        <RadioGroup disabled={disabled} value={typeof value === 'string' ? value : ''} onValueChange={(next) => onAnswer(question.id, next)}>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {question.options.map((option) => (
              <label key={option} className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 text-sm">
                <RadioGroupItem disabled={disabled} value={option} />
                {option}
              </label>
            ))}
          </div>
        </RadioGroup>
      )}

      {question.type === 'multi' && (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {question.options.map((option) => {
            const selected = Array.isArray(value) ? value : [];
            return (
              <label key={option} className="flex items-center gap-3 rounded-lg border border-slate-200 p-3 text-sm">
                <Checkbox
                  disabled={disabled}
                  checked={selected.includes(option)}
                  onCheckedChange={(checked) => onMultiAnswer(question.id, option, checked as boolean)}
                />
                {option}
              </label>
            );
          })}
        </div>
      )}

      {question.type === 'matrix' && (
        <div className="space-y-5">
          {question.items.map((item) => {
            const matrix = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
            const itemValue = matrix[item] ?? 0;
            return (
              <div key={item}>
                <div className="mb-2 flex items-center justify-between gap-4">
                  <p className="text-sm text-slate-700">{item}</p>
                  <span className="rounded-md bg-slate-100 px-2 py-1 text-sm font-semibold text-slate-900">
                    {itemValue}/4
                  </span>
                </div>
                <Slider
                  disabled={disabled}
                  value={[itemValue]}
                  onValueChange={(next) => onMatrixAnswer(question.id, item, next[0])}
                  max={4}
                  step={1}
                />
              </div>
            );
          })}
        </div>
      )}

      {question.type === 'inputs' && (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {question.items.map((item) => {
            const inputValues = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
            const itemValue = inputValues[item] ?? '';

            return (
              <div key={item}>
                <Label>{item}</Label>
                <Input
                  disabled={disabled}
                  value={String(itemValue)}
                  onChange={(event) => onInputAnswer(question.id, item, event.target.value)}
                  className="mt-2 rounded-lg"
                  placeholder="Informar valor"
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
