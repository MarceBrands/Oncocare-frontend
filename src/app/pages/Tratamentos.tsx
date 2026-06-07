import { Outlet } from 'react-router';
import { AlertCircle, Calendar, Clock, Search } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Input } from '../components/ui/input';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../components/ui/accordion';

const treatments = [
  {
    id: 1,
    patient: 'Maria Santos Silva',
    type: 'Quimioterapia',
    protocol: 'AC-T',
    status: 'active',
    startDate: '2026-03-01',
    endDate: '2026-07-15',
    progress: 70,
    sessions: { completed: 8, total: 12 },
    nextSession: '2026-06-05',
    adverseEffects: ['Fadiga intensa', 'Nausea', 'Queda de cabelo'],
  },
  {
    id: 2,
    patient: 'Ana Paula Oliveira',
    type: 'Radioterapia',
    protocol: 'IMRT Pelvica',
    status: 'active',
    startDate: '2026-04-15',
    endDate: '2026-06-30',
    progress: 55,
    sessions: { completed: 14, total: 25 },
    nextSession: '2026-06-02',
    adverseEffects: ['Fadiga leve', 'Irritacao cutanea'],
  },
  {
    id: 3,
    patient: 'Juliana Costa',
    type: 'Hormonioterapia',
    protocol: 'Tamoxifeno',
    status: 'active',
    startDate: '2026-01-10',
    endDate: '2031-01-10',
    progress: 10,
    sessions: { completed: 4, total: 60 },
    nextSession: '2026-07-10',
    adverseEffects: ['Fogachos', 'Alteracoes de humor'],
  },
  {
    id: 4,
    patient: 'Fernanda Lima',
    type: 'Braquiterapia',
    protocol: 'HDR',
    status: 'scheduled',
    startDate: '2026-06-10',
    endDate: '2026-06-24',
    progress: 0,
    sessions: { completed: 0, total: 4 },
    nextSession: '2026-06-10',
    adverseEffects: [],
  },
];

const stats = [
  { label: 'Total', value: 64 },
  { label: 'Em andamento', value: 42 },
  { label: 'Concluidos no mes', value: 8 },
  { label: 'Agendados', value: 14 },
];

function formatDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString('pt-BR');
}

function getStatusLabel(status: string) {
  if (status === 'active') return 'Em andamento';
  if (status === 'scheduled') return 'Agendado';
  return 'Concluido';
}

export function Tratamentos() {
  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-950">Tratamentos</h1>
        <p className="text-slate-600 mt-2">
          Acompanhamento objetivo dos protocolos, sessoes e proximas etapas.
        </p>
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
          {treatments.map((treatment) => (
            <AccordionItem key={treatment.id} value={String(treatment.id)} className="border-slate-200 px-5">
              <AccordionTrigger className="hover:no-underline">
                <div className="grid w-full grid-cols-1 gap-2 pr-4 text-left md:grid-cols-[minmax(0,1.3fr)_12rem_9rem_8rem] md:items-center md:gap-4">
                  <div>
                    <p className="font-semibold text-slate-950">{treatment.patient}</p>
                    <p className="mt-1 text-xs text-slate-500">Protocolo {treatment.protocol}</p>
                  </div>
                  <span className="text-sm text-slate-700">{treatment.type}</span>
                  <Badge variant="secondary" className="w-fit bg-slate-100 text-slate-700">
                    {getStatusLabel(treatment.status)}
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
                  <Info label="Proxima sessao" value={formatDate(treatment.nextSession)} icon={<Clock className="size-4" />} />
                  <Info label="Sessoes" value={`${treatment.sessions.completed} de ${treatment.sessions.total}`} icon={<Calendar className="size-4" />} />
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

function Info({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div>
      <p className="flex items-center gap-2 text-xs text-slate-500">{icon}{label}</p>
      <p className="mt-1 text-sm font-medium text-slate-900">{value}</p>
    </div>
  );
}
