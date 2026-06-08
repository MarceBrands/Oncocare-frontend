import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Outlet } from 'react-router';
import { Activity, Calendar, Clock, Edit3, Plus, Search } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../components/ui/accordion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { supabase, type PacienteRow, type PacienteTratamentoRow } from '../../lib/supabase';
import {
  formatCompletion,
  formatDate,
  formatTimeSinceLastSession,
  getTreatmentCompletion,
  validateTreatment,
  type TreatmentFormValues,
} from '../../lib/treatments';

const emptyForm: TreatmentFormValues = {
  paciente_id: '',
  tipo_tratamento: '',
  status: 'em_andamento',
  data_inicio: null,
  data_fim: null,
  observacoes: '',
  sessoes_previstas: null,
  sessoes_realizadas: null,
  ultima_sessao: null,
};

const statusOptions = [
  { value: 'em_andamento', label: 'Em andamento' },
  { value: 'concluido', label: 'Concluido' },
  { value: 'interrompido', label: 'Interrompido' },
  { value: 'suspenso', label: 'Suspenso' },
  { value: 'aguardando_inicio', label: 'Aguardando inicio' },
];

function getStatusLabel(status: string) {
  return statusOptions.find((option) => option.value === status)?.label ?? status;
}

function numberFromInput(value: string) {
  return value === '' ? null : Number(value);
}

function inputDate(value: string | null) {
  return value ?? '';
}

function normalizeForm(values: TreatmentFormValues) {
  return {
    ...values,
    tipo_tratamento: values.tipo_tratamento.trim(),
    data_inicio: values.data_inicio || null,
    data_fim: values.data_fim || null,
    ultima_sessao: values.ultima_sessao || null,
    observacoes: values.observacoes?.trim() || null,
  };
}

export function Tratamentos() {
  const [treatments, setTreatments] = useState<PacienteTratamentoRow[]>([]);
  const [patients, setPatients] = useState<PacienteRow[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [editingTreatment, setEditingTreatment] = useState<PacienteTratamentoRow | null>(null);
  const [form, setForm] = useState<TreatmentFormValues>(emptyForm);

  async function loadData() {
    setLoading(true);
    setError(null);

    const [{ data: treatmentData, error: treatmentError }, { data: patientData, error: patientError }] = await Promise.all([
      supabase
        .from('paciente_tratamentos')
        .select('*, pacientes(id, nome, cpf)')
        .order('created_at', { ascending: false }),
      supabase.from('pacientes').select('*').order('nome'),
    ]);

    if (treatmentError || patientError) {
      setError(treatmentError?.message ?? patientError?.message ?? 'Erro ao carregar tratamentos.');
      setTreatments([]);
      setPatients([]);
    } else {
      setTreatments((treatmentData ?? []) as PacienteTratamentoRow[]);
      setPatients((patientData ?? []) as PacienteRow[]);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  const stats = useMemo(() => {
    return [
      { label: 'Total', value: treatments.length },
      { label: 'Em andamento', value: treatments.filter((item) => item.status === 'em_andamento').length },
      { label: 'Concluidos', value: treatments.filter((item) => item.status === 'concluido').length },
      { label: 'Interrompidos', value: treatments.filter((item) => item.status === 'interrompido').length },
    ];
  }, [treatments]);

  const filteredTreatments = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) {
      return treatments;
    }

    return treatments.filter((treatment) => {
      return (
        treatment.tipo_tratamento.toLowerCase().includes(term) ||
        treatment.status.toLowerCase().includes(term) ||
        treatment.pacientes?.nome?.toLowerCase().includes(term) ||
        treatment.observacoes?.toLowerCase().includes(term)
      );
    });
  }, [search, treatments]);

  function openCreate() {
    setEditingTreatment(null);
    setForm(emptyForm);
    setFormErrors([]);
    setOpen(true);
  }

  function openEdit(treatment: PacienteTratamentoRow) {
    setEditingTreatment(treatment);
    setForm({
      paciente_id: treatment.paciente_id,
      tipo_tratamento: treatment.tipo_tratamento,
      status: treatment.status,
      data_inicio: treatment.data_inicio,
      data_fim: treatment.data_fim,
      observacoes: treatment.observacoes ?? '',
      sessoes_previstas: treatment.sessoes_previstas,
      sessoes_realizadas: treatment.sessoes_realizadas,
      ultima_sessao: treatment.ultima_sessao,
    });
    setFormErrors([]);
    setOpen(true);
  }

  async function saveTreatment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const payload = normalizeForm(form);
    const validation = validateTreatment(payload);

    if (!validation.valid) {
      setFormErrors(validation.errors);
      return;
    }

    setSaving(true);
    setFormErrors([]);

    const response = editingTreatment
      ? await supabase.from('paciente_tratamentos').update(payload).eq('id', editingTreatment.id)
      : await supabase.from('paciente_tratamentos').insert(payload);

    if (response.error) {
      setFormErrors([response.error.message]);
    } else {
      setOpen(false);
      await loadData();
    }

    setSaving(false);
  }

  return (
    <>
      <div className="mb-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-950">Tratamentos</h1>
            <p className="mt-2 max-w-3xl text-slate-600">
              Historico terapeutico das pacientes para contextualizar sintomas, exames e questionarios no seguimento pos-tratamento.
            </p>
          </div>
          <Button onClick={openCreate} className="bg-cyan-700 hover:bg-cyan-800">
            <Plus className="mr-2 size-5" />
            Novo tratamento
          </Button>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs text-slate-500">{stat.label}</p>
            <p className="mt-1 text-2xl font-bold text-slate-950">{stat.value}</p>
          </Card>
        ))}
      </div>

      <Card className="mb-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="rounded-lg border-slate-200 pl-9"
            placeholder="Buscar por paciente, tipo de tratamento, status ou observacoes..."
          />
        </div>
      </Card>

      {loading && (
        <Card className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-slate-600">Carregando historico terapeutico...</p>
        </Card>
      )}

      {!loading && error && (
        <Card className="rounded-lg border border-red-200 bg-red-50 p-6 shadow-sm">
          <p className="font-semibold text-red-900">Nao consegui carregar tratamentos.</p>
          <p className="mt-2 text-sm text-red-800">{error}</p>
        </Card>
      )}

      {!loading && !error && (
        <Card className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="hidden grid-cols-[minmax(0,1.3fr)_12rem_10rem_9rem_9rem] gap-4 border-b border-slate-200 bg-slate-50 px-5 py-3 text-xs font-semibold uppercase text-slate-500 md:grid">
            <span>Paciente</span>
            <span>Tratamento</span>
            <span>Status</span>
            <span>Sessoes</span>
            <span>Conclusao</span>
          </div>

          {filteredTreatments.length === 0 ? (
            <div className="p-6">
              <p className="font-semibold text-slate-950">Nenhum tratamento encontrado.</p>
              <p className="mt-2 text-sm text-slate-600">Cadastre o historico terapeutico da paciente para apoiar a leitura clinica dos alertas.</p>
            </div>
          ) : (
            <Accordion type="single" collapsible>
              {filteredTreatments.map((treatment) => {
                const completion = getTreatmentCompletion(treatment);
                const completionLabel = formatCompletion(treatment);

                return (
                  <AccordionItem key={treatment.id} value={String(treatment.id)} className="border-slate-200 px-5">
                    <AccordionTrigger className="hover:no-underline">
                      <div className="grid w-full grid-cols-1 gap-2 pr-4 text-left md:grid-cols-[minmax(0,1.3fr)_12rem_10rem_9rem_9rem] md:items-center md:gap-4">
                        <div>
                          <p className="font-semibold text-slate-950">{treatment.pacientes?.nome ?? 'Paciente nao identificada'}</p>
                        </div>
                        <span className="text-sm text-slate-700">{treatment.tipo_tratamento}</span>
                        <Badge variant="secondary" className="w-fit bg-slate-100 text-slate-700">
                          {getStatusLabel(treatment.status)}
                        </Badge>
                        <span className="text-sm text-slate-700">
                          {treatment.sessoes_realizadas ?? 0}
                          {treatment.sessoes_previstas ? ` de ${treatment.sessoes_previstas}` : ''}
                        </span>
                        <div className="min-w-24">
                          <p className="mb-1 text-xs text-slate-500">{completionLabel ?? 'Sem percentual'}</p>
                          {completion !== null && <Progress value={completion} className="h-2" />}
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid gap-4 rounded-lg bg-slate-50 p-4 md:grid-cols-2 lg:grid-cols-4">
                        <Info label="Tipo do tratamento" value={treatment.tipo_tratamento} icon={<Activity className="size-4" />} />
                        <Info label="Status" value={getStatusLabel(treatment.status)} icon={<Activity className="size-4" />} />
                        <Info label="Data de inicio" value={formatDate(treatment.data_inicio)} icon={<Calendar className="size-4" />} />
                        <Info label="Data de termino" value={formatDate(treatment.data_fim)} icon={<Calendar className="size-4" />} />
                        <Info label="Sessoes previstas" value={String(treatment.sessoes_previstas ?? 'Nao informado')} icon={<Activity className="size-4" />} />
                        <Info label="Sessoes realizadas" value={String(treatment.sessoes_realizadas ?? 'Nao informado')} icon={<Activity className="size-4" />} />
                        <Info label="Ultima sessao" value={formatDate(treatment.ultima_sessao)} icon={<Clock className="size-4" />} />
                        <Info label="Tempo desde ultima sessao" value={formatTimeSinceLastSession(treatment)} icon={<Clock className="size-4" />} />
                      </div>

                      <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
                        <p className="text-xs text-slate-500">Observacoes</p>
                        <p className="mt-1 whitespace-pre-wrap text-sm text-slate-800">{treatment.observacoes || 'Sem observacoes registradas.'}</p>
                      </div>

                      <div className="mt-4 flex justify-end">
                        <Button variant="outline" size="sm" onClick={() => openEdit(treatment)}>
                          <Edit3 className="mr-2 size-4" />
                          Editar tratamento
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          )}
        </Card>
      )}

      <TreatmentDialog
        open={open}
        form={form}
        patients={patients}
        saving={saving}
        errors={formErrors}
        editing={Boolean(editingTreatment)}
        onOpenChange={setOpen}
        onChange={setForm}
        onSubmit={saveTreatment}
      />

      <Outlet />
    </>
  );
}

function TreatmentDialog({
  open,
  form,
  patients,
  saving,
  errors,
  editing,
  onOpenChange,
  onChange,
  onSubmit,
}: {
  open: boolean;
  form: TreatmentFormValues;
  patients: PacienteRow[];
  saving: boolean;
  errors: string[];
  editing: boolean;
  onOpenChange: (open: boolean) => void;
  onChange: (form: TreatmentFormValues) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{editing ? 'Editar tratamento' : 'Cadastrar tratamento'}</DialogTitle>
          <DialogDescription>
            Registre apenas dados do historico terapeutico da paciente.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-5">
          {errors.length > 0 && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
              {errors.map((error) => (
                <p key={error}>{error}</p>
              ))}
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Paciente">
              <Select value={form.paciente_id} onValueChange={(value) => onChange({ ...form, paciente_id: value })}>
                <SelectTrigger className="mt-2 rounded-lg border-slate-200">
                  <SelectValue placeholder="Selecione a paciente" />
                </SelectTrigger>
                <SelectContent>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Status">
              <Select value={form.status} onValueChange={(value) => onChange({ ...form, status: value })}>
                <SelectTrigger className="mt-2 rounded-lg border-slate-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            <Field label="Tipo de tratamento">
              <Input
                value={form.tipo_tratamento}
                onChange={(event) => onChange({ ...form, tipo_tratamento: event.target.value })}
                className="mt-2 rounded-lg border-slate-200"
                placeholder="Quimioterapia, radioterapia, cirurgia..."
              />
            </Field>

            <Field label="Ultima sessao">
              <Input
                type="date"
                value={inputDate(form.ultima_sessao)}
                onChange={(event) => onChange({ ...form, ultima_sessao: event.target.value || null })}
                className="mt-2 rounded-lg border-slate-200"
              />
            </Field>

            <Field label="Data de inicio">
              <Input
                type="date"
                value={inputDate(form.data_inicio)}
                onChange={(event) => onChange({ ...form, data_inicio: event.target.value || null })}
                className="mt-2 rounded-lg border-slate-200"
              />
            </Field>

            <Field label="Data de termino">
              <Input
                type="date"
                value={inputDate(form.data_fim)}
                onChange={(event) => onChange({ ...form, data_fim: event.target.value || null })}
                className="mt-2 rounded-lg border-slate-200"
              />
            </Field>

            <Field label="Sessoes previstas">
              <Input
                type="number"
                min={0}
                value={form.sessoes_previstas ?? ''}
                onChange={(event) => onChange({ ...form, sessoes_previstas: numberFromInput(event.target.value) })}
                className="mt-2 rounded-lg border-slate-200"
              />
            </Field>

            <Field label="Sessoes realizadas">
              <Input
                type="number"
                min={0}
                value={form.sessoes_realizadas ?? ''}
                onChange={(event) => onChange({ ...form, sessoes_realizadas: numberFromInput(event.target.value) })}
                className="mt-2 rounded-lg border-slate-200"
              />
            </Field>
          </div>

          <Field label="Observacoes">
            <Textarea
              value={form.observacoes ?? ''}
              onChange={(event) => onChange({ ...form, observacoes: event.target.value })}
              className="mt-2 min-h-28 rounded-lg border-slate-200"
              placeholder="Contexto clinico relevante para seguimento e interpretacao de sintomas."
            />
          </Field>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving} className="bg-cyan-700 hover:bg-cyan-800">
              {saving ? 'Salvando...' : 'Salvar tratamento'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
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

function Info({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div>
      <p className="flex items-center gap-2 text-xs text-slate-500">
        {icon}
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-medium text-slate-900">{value}</p>
    </div>
  );
}
