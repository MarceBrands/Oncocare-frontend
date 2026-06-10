import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { ArrowLeft, Save, ShieldCheck } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { PatientAvatar, clearStoredPatientPhoto, setStoredPatientPhoto } from '../components/PatientAvatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { supabase, type PacienteRow } from '../../lib/supabase';

type PatientDataForm = {
  nome: string;
  cpf: string;
  data_nascimento: string;
  tipo_atendimento: string;
  menopausa: string;
  ciclo_menstrual: string;
  dum: string;
  teve_outro_cancer: string;
  outro_cancer_qual: string;
};

const emptyForm: PatientDataForm = {
  nome: '',
  cpf: '',
  data_nascimento: '',
  tipo_atendimento: 'SUS',
  menopausa: '',
  ciclo_menstrual: '',
  dum: '',
  teve_outro_cancer: '',
  outro_cancer_qual: '',
};

function toForm(patient: PacienteRow): PatientDataForm {
  return {
    nome: patient.nome ?? '',
    cpf: patient.cpf ?? '',
    data_nascimento: patient.data_nascimento ?? '',
    tipo_atendimento: patient.tipo_atendimento ?? 'SUS',
    menopausa: patient.menopausa ?? '',
    ciclo_menstrual: patient.ciclo_menstrual ?? '',
    dum: patient.dum ?? '',
    teve_outro_cancer:
      patient.teve_outro_cancer === null || patient.teve_outro_cancer === undefined
        ? ''
        : patient.teve_outro_cancer
          ? 'sim'
          : 'nao',
    outro_cancer_qual: patient.outro_cancer_qual ?? '',
  };
}

export function PacienteDados() {
  const [patient, setPatient] = useState<PacienteRow | null>(null);
  const [form, setForm] = useState<PatientDataForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const cicloEnabled = form.menopausa === 'nao';
  const dumEnabled = cicloEnabled && ['regular', 'irregular'].includes(form.ciclo_menstrual);
  const outroCancerEnabled = form.teve_outro_cancer === 'sim';
  const maxToday = useMemo(() => new Date().toISOString().slice(0, 10), []);

  useEffect(() => {
    async function loadPatient() {
      setLoading(true);
      setError('');

      const { data, error: loadError } = await supabase
        .from('pacientes')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (loadError || !data) {
        setPatient(null);
        setForm(emptyForm);
        setError(loadError?.message ?? 'Nenhuma paciente encontrada.');
      } else {
        const loadedPatient = data as PacienteRow;
        setPatient(loadedPatient);
        setForm(toForm(loadedPatient));
      }

      setLoading(false);
    }

    loadPatient();
  }, []);

  function update(values: Partial<PatientDataForm>) {
    setForm((current) => {
      const next = { ...current, ...values };

      if (values.menopausa && values.menopausa !== 'nao') {
        next.ciclo_menstrual = '';
        next.dum = '';
      }

      if (values.ciclo_menstrual && !['regular', 'irregular'].includes(values.ciclo_menstrual)) {
        next.dum = '';
      }

      if (values.teve_outro_cancer && values.teve_outro_cancer !== 'sim') {
        next.outro_cancer_qual = '';
      }

      return next;
    });
    setMessage('');
    setError('');
  }

  async function handleSave() {
    setMessage('');
    setError('');

    if (!patient) {
      setError('Nenhuma paciente selecionada para atualizar.');
      return;
    }

    if (!form.nome.trim() || !form.cpf.trim() || !form.data_nascimento) {
      setError('Nome, CPF e data de nascimento são obrigatórios.');
      return;
    }

    setSaving(true);

    const payload = {
      nome: form.nome.trim(),
      cpf: form.cpf.trim(),
      data_nascimento: form.data_nascimento,
      tipo_atendimento: form.tipo_atendimento,
      menopausa: form.menopausa || null,
      ciclo_menstrual: form.ciclo_menstrual || null,
      dum: form.dum || null,
      teve_outro_cancer:
        form.teve_outro_cancer === ''
          ? null
          : form.teve_outro_cancer === 'sim',
      outro_cancer_qual: form.teve_outro_cancer === 'sim' ? form.outro_cancer_qual.trim() || null : null,
      updated_at: new Date().toISOString(),
    };

    const { data, error: saveError } = await supabase
      .from('pacientes')
      .update(payload)
      .eq('id', patient.id)
      .select('*')
      .single();

    if (saveError || !data) {
      setError(saveError?.message ?? 'Não foi possível salvar seus dados.');
    } else {
      const updatedPatient = data as PacienteRow;
      setPatient(updatedPatient);
      setForm(toForm(updatedPatient));
      setMessage('Dados atualizados com sucesso.');
    }

    setSaving(false);
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <Link to="/paciente" className="flex items-center gap-3">
            <PatientAvatar name={patient?.nome} className="size-11" />
            <div>
              <p className="font-bold leading-tight">OncoCare</p>
              <p className="text-xs text-slate-500">Meus dados</p>
            </div>
          </Link>
          <Link to="/paciente">
            <Button variant="outline" className="rounded-lg">
              <ArrowLeft className="mr-2 size-4" />
              Voltar
            </Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-5 py-8 lg:px-8">
        <div className="mb-6">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-sm font-medium text-rose-800">
            <ShieldCheck className="size-4" />
            Informações vinculadas ao cadastro de paciente
          </div>
          <h1 className="text-3xl font-bold text-slate-950">Meus dados</h1>
          <p className="mt-2 max-w-3xl text-slate-600">
            Confira e atualize os dados cadastrais usados pela equipe para acompanhamento.
          </p>
        </div>

        {loading && (
          <Card className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-slate-600">Carregando seus dados...</p>
          </Card>
        )}

        {!loading && !patient && (
          <Card className="rounded-lg border border-amber-200 bg-amber-50 p-6 shadow-sm">
            <p className="font-semibold text-amber-950">Não encontrei uma paciente cadastrada.</p>
            <p className="mt-2 text-sm text-slate-700">{error}</p>
          </Card>
        )}

        {!loading && patient && (
          <Card className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex flex-col gap-4 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <PatientAvatar name={patient.nome} className="size-16" />
                <div>
                  <h2 className="font-semibold text-slate-950">Dados pessoais</h2>
                  <p className="text-sm text-slate-500">Tabela pacientes</p>
                </div>
              </div>
              <div className="flex flex-col gap-2 sm:items-end">
                <Label htmlFor="patientPhoto" className="text-sm font-medium text-slate-700">
                  Foto da paciente
                </Label>
                <div className="flex flex-wrap gap-2">
                  <Input
                    id="patientPhoto"
                    type="file"
                    accept="image/*"
                    className="max-w-64 rounded-lg"
                    onChange={(event) => {
                      const file = event.target.files?.[0];

                      if (!file) return;

                      const reader = new FileReader();
                      reader.onload = () => {
                        if (typeof reader.result === 'string') {
                          setStoredPatientPhoto(reader.result);
                        }
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                  <Button type="button" variant="outline" className="rounded-lg" onClick={clearStoredPatientPhoto}>
                    Remover
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <Field label="Nome completo">
                <Input value={form.nome} onChange={(event) => update({ nome: event.target.value })} className="mt-2 rounded-lg" />
              </Field>

              <Field label="CPF">
                <Input value={form.cpf} onChange={(event) => update({ cpf: event.target.value })} className="mt-2 rounded-lg" />
              </Field>

              <Field label="Data de nascimento">
                <Input
                  type="date"
                  value={form.data_nascimento}
                  max={maxToday}
                  onChange={(event) => update({ data_nascimento: event.target.value })}
                  className="mt-2 rounded-lg"
                />
              </Field>

              <Field label="Tipo de atendimento">
                <Select value={form.tipo_atendimento} onValueChange={(value) => update({ tipo_atendimento: value })}>
                  <SelectTrigger className="mt-2 rounded-lg">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SUS">SUS</SelectItem>
                    <SelectItem value="Privado">Privado</SelectItem>
                    <SelectItem value="Particular">Particular</SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Está na menopausa?">
                <Select value={form.menopausa} onValueChange={(value) => update({ menopausa: value })}>
                  <SelectTrigger className="mt-2 rounded-lg">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sim">Sim</SelectItem>
                    <SelectItem value="nao">Não</SelectItem>
                    <SelectItem value="ignorado">Prefiro não informar</SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Ciclo menstrual">
                <Select
                  value={form.ciclo_menstrual}
                  onValueChange={(value) => update({ ciclo_menstrual: value })}
                  disabled={!cicloEnabled}
                >
                  <SelectTrigger className="mt-2 rounded-lg">
                    <SelectValue placeholder={cicloEnabled ? 'Selecione' : 'Habilitado quando menopausa = Não'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="regular">Regular</SelectItem>
                    <SelectItem value="irregular">Irregular</SelectItem>
                    <SelectItem value="ignorado">Prefiro não informar</SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Data da última menstruação">
                <Input
                  type="date"
                  value={form.dum}
                  min={form.data_nascimento || undefined}
                  max={maxToday}
                  disabled={!dumEnabled}
                  onChange={(event) => update({ dum: event.target.value })}
                  className="mt-2 rounded-lg"
                />
              </Field>

              <Field label="Já teve outro câncer?">
                <Select value={form.teve_outro_cancer} onValueChange={(value) => update({ teve_outro_cancer: value })}>
                  <SelectTrigger className="mt-2 rounded-lg">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sim">Sim</SelectItem>
                    <SelectItem value="nao">Não</SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              <Field label="Qual outro câncer?">
                <Input
                  value={form.outro_cancer_qual}
                  disabled={!outroCancerEnabled}
                  onChange={(event) => update({ outro_cancer_qual: event.target.value })}
                  placeholder="Informe se desejar"
                  className="mt-2 rounded-lg"
                />
              </Field>
            </div>

            {error && <p className="mt-5 rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}
            {message && <p className="mt-5 rounded-lg bg-rose-50 p-3 text-sm text-rose-800">{message}</p>}

            <div className="mt-6 flex justify-end">
              <Button onClick={handleSave} disabled={saving} className="bg-rose-700 hover:bg-rose-800">
                <Save className="mr-2 size-4" />
                {saving ? 'Salvando...' : 'Salvar alterações'}
              </Button>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label>{label}</Label>
      {children}
    </div>
  );
}
