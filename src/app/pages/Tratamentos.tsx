import { useEffect, useMemo, useState } from 'react';
import { Outlet } from 'react-router';
import { AlertCircle, Calendar, Clock, Plus, Search } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import {
  Dialog,
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../components/ui/accordion';
import { createTreatment, listPatients, listTreatments, type PacienteRow, type Treatment } from '../../lib/api';
import {
  buildTreatmentInput,
  createEmptyTreatmentForm,
  getTreatmentStatusLabel,
  treatmentStatusOptions,
  type TreatmentFormState,
} from './tratamentos-form';

function formatDate(date?: string | null) {
  if (!date) return 'Nao informado';
  return new Date(`${date}T00:00:00`).toLocaleDateString('pt-BR');
}

export function Tratamentos() {
  const [apiTreatments, setApiTreatments] = useState<Treatment[]>([]);
  const [patients, setPatients] = useState<PacienteRow[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<TreatmentFormState>(createEmptyTreatmentForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPageData();
  }, []);

  async function loadPageData() {
    setLoading(true);
    setError(null);

    try {
      const [treatments, patientRows] = await Promise.all([listTreatments(), listPatients()]);
      setApiTreatments(treatments);
      setPatients(patientRows);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Erro inesperado.');
      setApiTreatments([]);
      setPatients([]);
    }

    setLoading(false);
  }

  function updateForm(field: keyof TreatmentFormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function handleDialogOpenChange(open: boolean) {
    setDialogOpen(open);
    setFormError(null);

    if (!open) {
      setForm(createEmptyTreatmentForm());
    }
  }

  async function handleCreateTreatment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    const result = buildTreatmentInput(form);

    if (!result.ok) {
      setFormError(result.error);
      return;
    }

    setSaving(true);

    try {
      await createTreatment(result.treatment);
      await loadPageData();
      handleDialogOpenChange(false);
    } catch (saveError) {
      setFormError(saveError instanceof Error ? saveError.message : 'Erro inesperado.');
    }

    setSaving(false);
  }

  const currentTreatments = apiTreatments;
  const filteredTreatments = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) {
      return currentTreatments;
    }

    return currentTreatments.filter((treatment) => {
      return (
        treatment.patient.toLowerCase().includes(term) ||
        treatment.protocol.toLowerCase().includes(term) ||
        treatment.type.toLowerCase().includes(term)
      );
    });
  }, [currentTreatments, search]);
  const currentStats = [
    { label: 'Total', value: currentTreatments.length },
    {
      label: 'Em andamento',
      value: currentTreatments.filter((treatment) => treatment.status === 'active').length,
    },
    {
      label: 'Concluidos no mes',
      value: currentTreatments.filter((treatment) => treatment.status === 'completed').length,
    },
    {
      label: 'Agendados',
      value: currentTreatments.filter((treatment) => treatment.status === 'scheduled').length,
    },
  ];

  return (
    <>
      <div className="mb-6">
        <div className="mb-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-950">Tratamentos</h1>
            <p className="mt-2 max-w-3xl text-slate-600">
              Historico terapeutico das pacientes para contextualizar sintomas, exames e questionarios.
            </p>
          </div>

          <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
            <DialogTrigger asChild>
              <Button className="w-fit bg-cyan-700 shadow-sm hover:bg-cyan-800">
                <Plus className="size-5" />
                Novo tratamento
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-3xl">
              <form onSubmit={handleCreateTreatment} className="space-y-5">
                <DialogHeader>
                  <DialogTitle>Cadastrar tratamento</DialogTitle>
                  <DialogDescription>
                    Registre apenas dados do historico terapeutico da paciente.
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Paciente">
                    <Select
                      value={form.patientId}
                      onValueChange={(value) => updateForm('patientId', value)}
                      disabled={patients.length === 0 || saving}
                    >
                      <SelectTrigger className="rounded-lg border-slate-200">
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
                    {patients.length === 0 && (
                      <p className="text-xs text-slate-500">Cadastre uma paciente antes de iniciar tratamento.</p>
                    )}
                  </Field>

                  <Field label="Status">
                    <Select
                      value={form.status}
                      onValueChange={(value) => updateForm('status', value)}
                      disabled={saving}
                    >
                      <SelectTrigger className="rounded-lg border-slate-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {treatmentStatusOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>

                  <Field label="Tipo de tratamento">
                    <Input
                      value={form.type}
                      onChange={(event) => updateForm('type', event.target.value)}
                      disabled={saving}
                      placeholder="Quimioterapia, radioterapia, cirurgia..."
                      className="rounded-lg border-slate-200"
                    />
                  </Field>

                  <Field label="Protocolo">
                    <Input
                      value={form.protocol}
                      onChange={(event) => updateForm('protocol', event.target.value)}
                      disabled={saving}
                      placeholder="AC-T, RT, acompanhamento..."
                      className="rounded-lg border-slate-200"
                    />
                  </Field>

                  <Field label="Data de inicio">
                    <Input
                      type="date"
                      value={form.startDate}
                      onChange={(event) => updateForm('startDate', event.target.value)}
                      disabled={saving}
                      className="rounded-lg border-slate-200"
                    />
                  </Field>

                  <Field label="Data de termino">
                    <Input
                      type="date"
                      value={form.endDate}
                      onChange={(event) => updateForm('endDate', event.target.value)}
                      disabled={saving}
                      className="rounded-lg border-slate-200"
                    />
                  </Field>

                  <Field label="Ultima sessao">
                    <Input
                      type="date"
                      value={form.lastSession}
                      onChange={(event) => updateForm('lastSession', event.target.value)}
                      disabled={saving}
                      className="rounded-lg border-slate-200"
                    />
                  </Field>

                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Sessoes previstas">
                      <Input
                        inputMode="numeric"
                        value={form.plannedSessions}
                        onChange={(event) => updateForm('plannedSessions', event.target.value)}
                        disabled={saving}
                        className="rounded-lg border-slate-200"
                      />
                    </Field>

                    <Field label="Sessoes realizadas">
                      <Input
                        inputMode="numeric"
                        value={form.completedSessions}
                        onChange={(event) => updateForm('completedSessions', event.target.value)}
                        disabled={saving}
                        className="rounded-lg border-slate-200"
                      />
                    </Field>
                  </div>
                </div>

                <Field label="Observacoes">
                  <Textarea
                    value={form.notes}
                    onChange={(event) => updateForm('notes', event.target.value)}
                    disabled={saving}
                    placeholder="Contexto clinico relevante para seguimento e interpretacao de sintomas."
                    className="min-h-28 rounded-lg border-slate-200"
                  />
                </Field>

                {formError && <p className="text-sm text-red-600">{formError}</p>}

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => handleDialogOpenChange(false)} disabled={saving}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="bg-cyan-700 hover:bg-cyan-800" disabled={saving}>
                    {saving ? 'Salvando...' : 'Salvar tratamento'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading && <p className="mt-2 text-sm text-slate-500">Carregando tratamentos...</p>}
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {currentStats.map((stat) => (
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
            placeholder="Buscar por paciente, protocolo ou tipo de tratamento..."
          />
        </div>
      </Card>

      <Card className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="hidden grid-cols-[minmax(0,1.3fr)_12rem_9rem_8rem] gap-4 border-b border-slate-200 bg-slate-50 px-5 py-3 text-xs font-semibold uppercase text-slate-500 md:grid">
          <span>Paciente</span>
          <span>Tratamento</span>
          <span>Status</span>
          <span>Progresso</span>
        </div>

        <Accordion type="single" collapsible>
          {!loading && filteredTreatments.length === 0 && (
            <div className="px-5 py-8 text-sm text-slate-500">Nenhum tratamento encontrado.</div>
          )}
          {filteredTreatments.map((treatment) => (
            <AccordionItem key={treatment.id} value={String(treatment.id)} className="border-slate-200 px-5">
              <AccordionTrigger className="hover:no-underline">
                <div className="grid w-full grid-cols-1 gap-2 pr-4 text-left md:grid-cols-[minmax(0,1.3fr)_12rem_9rem_8rem] md:items-center md:gap-4">
                  <div>
                    <p className="font-semibold text-slate-950">{treatment.patient}</p>
                    <p className="mt-1 text-xs text-slate-500">Protocolo {treatment.protocol}</p>
                  </div>
                  <span className="text-sm text-slate-700">{treatment.type}</span>
                  <Badge variant="secondary" className="w-fit bg-slate-100 text-slate-700">
                    {getTreatmentStatusLabel(treatment.status)}
                  </Badge>
                  <div className="min-w-24">
                    <p className="mb-1 text-xs text-slate-500">{treatment.progress}%</p>
                    <Progress value={treatment.progress} className="h-2" />
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="grid gap-4 rounded-lg bg-slate-50 p-4 md:grid-cols-3">
                  <Info label="Periodo" value={`${formatDate(treatment.startDate)} ate ${formatDate(treatment.endDate)}`} icon={<Calendar className="size-4" />} />
                  <Info label="Ultima sessao" value={formatDate(treatment.lastSession)} icon={<Clock className="size-4" />} />
                  <Info label="Proxima sessao" value={formatDate(treatment.nextSession)} icon={<Clock className="size-4" />} />
                  <Info label="Sessoes" value={`${treatment.sessions.completed} de ${treatment.sessions.total}`} icon={<Calendar className="size-4" />} />
                  {treatment.notes && (
                    <Info label="Observacoes" value={treatment.notes} icon={<AlertCircle className="size-4" />} />
                  )}
                </div>

                <div className="mt-4">
                  <p className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-800">
                    <AlertCircle className="size-4 text-amber-700" />
                    Efeitos observados
                  </p>
                  {treatment.adverseEffects.length === 0 ? (
                    <p className="text-sm text-slate-500">Nenhum efeito registrado.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {treatment.adverseEffects.map((effect) => (
                        <Badge key={effect} variant="outline" className="border-amber-200 bg-amber-50 text-amber-800">
                          {effect}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Card>

      <Outlet />
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function Info({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div>
      <p className="flex items-center gap-2 text-xs text-slate-500">{icon}{label}</p>
      <p className="mt-1 text-sm font-medium text-slate-900">{value}</p>
    </div>
  );
}
