import { Link } from 'react-router';
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  HeartPulse,
  ShieldCheck,
  Stethoscope,
  Users,
} from 'lucide-react';
import { Button } from '../components/ui/button';

const impactItems = [
  {
    icon: Users,
    title: 'Seguimento ativo',
    text: 'Centraliza pacientes, diagnosticos, tratamentos, exames e avaliacoes em uma rotina unica de cuidado.',
  },
  {
    icon: AlertTriangle,
    title: 'Alertas clinicos',
    text: 'Sinaliza piora, sintomas importantes e necessidade de apoio profissional antes que o cuidado se perca.',
  },
  {
    icon: BarChart3,
    title: 'Gestao do cuidado',
    text: 'Transforma respostas semanais em indicadores para equipes, unidades publicas, clinicas privadas e atendimentos particulares.',
  },
];

const flowItems = [
  'Cadastrar paciente',
  'Registrar diagnostico',
  'Acompanhar tratamento',
  'Aplicar avaliacao',
  'Priorizar alertas',
];

export function Apresentacao() {
  return (
    <div className="min-h-screen bg-white text-slate-950">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-cyan-700">
              <HeartPulse className="size-6 text-white" />
            </div>
            <div>
              <p className="font-bold leading-tight">OncoCare</p>
              <p className="text-xs text-slate-500">Monitoramento oncologico</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/sintomas" className="hidden text-sm font-medium text-slate-600 hover:text-slate-950 sm:inline">
              Ver avaliacoes
            </Link>
            <Link to="/">
              <Button className="bg-cyan-700 hover:bg-cyan-800">
                Entrar
                <ArrowRight className="ml-2 size-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="border-b border-slate-200 bg-slate-950 text-white">
          <div className="mx-auto grid min-h-[calc(100vh-73px)] max-w-7xl items-center gap-10 px-5 py-12 lg:grid-cols-[0.92fr_1.08fr] lg:px-8">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-300/40 bg-cyan-300/10 px-3 py-1 text-sm text-cyan-100">
                <ShieldCheck className="size-4" />
                Plataforma clinica com banco Supabase
              </div>
              <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-normal sm:text-5xl lg:text-6xl">
                OncoCare
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
                Acompanhamento digital para pacientes com cancer de mama e cancer de colo do utero, conectando cadastro, tratamentos, exames, avaliacoes semanais e alertas clinicos em uma unica plataforma para SUS, clinicas privadas e atendimentos particulares.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link to="/">
                  <Button size="lg" className="w-full bg-cyan-700 hover:bg-cyan-600 sm:w-auto">
                    Entrar na plataforma
                    <ArrowRight className="ml-2 size-5" />
                  </Button>
                </Link>
                <Link to="/sintomas">
                  <Button size="lg" variant="outline" className="w-full border-slate-500 bg-transparent text-white hover:bg-white hover:text-slate-950 sm:w-auto">
                    Ver questionarios
                  </Button>
                </Link>
              </div>
            </div>

            <div className="rounded-xl border border-slate-700 bg-slate-900 p-4 shadow-2xl">
              <div className="rounded-lg border border-slate-700 bg-white text-slate-950">
                <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-9 items-center justify-center rounded-lg bg-cyan-700">
                      <Stethoscope className="size-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold">Painel clinico</p>
                      <p className="text-xs text-slate-500">Priorizacao da linha do cuidado</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800">
                    Online
                  </span>
                </div>
                <div className="grid gap-4 p-5 sm:grid-cols-2">
                  <PreviewMetric label="Pacientes" value="127" tone="teal" />
                  <PreviewMetric label="Alertas criticos" value="8" tone="red" />
                  <PreviewMetric label="Tratamentos ativos" value="64" tone="blue" />
                  <PreviewMetric label="Avaliacoes semanais" value="42" tone="amber" />
                </div>
                <div className="border-t border-slate-200 p-5">
                  <p className="mb-3 text-sm font-semibold">Fluxo assistencial</p>
                  <div className="space-y-3">
                    {flowItems.map((item, index) => (
                      <div key={item} className="flex items-center gap-3">
                        <span className="flex size-7 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-700">
                          {index + 1}
                        </span>
                        <div className="h-2 flex-1 rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-cyan-700"
                            style={{ width: `${95 - index * 13}%` }}
                          />
                        </div>
                        <span className="w-36 text-xs font-medium text-slate-600">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-normal text-cyan-700">Por que existe</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-950">
              Menos perda de seguimento, mais continuidade do cuidado.
            </h2>
            <p className="mt-4 text-slate-600">
              A proposta e apoiar equipes de saude no acompanhamento longitudinal, com dados simples de registrar e faceis de priorizar.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
            {impactItems.map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.title} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="mb-4 flex size-11 items-center justify-center rounded-lg bg-slate-100">
                    <Icon className="size-6 text-cyan-700" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-950">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{item.text}</p>
                </article>
              );
            })}
          </div>
        </section>

        <section className="border-t border-slate-200 bg-slate-50">
          <div className="mx-auto grid max-w-7xl gap-8 px-5 py-12 lg:grid-cols-[1fr_auto] lg:items-center lg:px-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-950">Pronta para demonstracao no hackathon.</h2>
              <p className="mt-3 max-w-2xl text-slate-600">
                A banca pode entender a solucao nesta pagina e depois entrar no aplicativo para testar cadastro, pacientes e avaliacoes.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link to="/">
                <Button className="w-full bg-cyan-700 hover:bg-cyan-800 sm:w-auto">
                  Abrir painel clinico
                </Button>
              </Link>
              <Link to="/pacientes">
                <Button variant="outline" className="w-full sm:w-auto">
                  Ver pacientes
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function PreviewMetric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: 'teal' | 'red' | 'blue' | 'amber';
}) {
  const tones = {
    teal: 'bg-cyan-50 text-cyan-800 border-cyan-100',
    red: 'bg-red-50 text-red-800 border-red-100',
    blue: 'bg-blue-50 text-blue-800 border-blue-100',
    amber: 'bg-amber-50 text-amber-800 border-amber-100',
  };

  return (
    <div className={`rounded-lg border p-4 ${tones[tone]}`}>
      <p className="text-xs font-medium">{label}</p>
      <p className="mt-1 text-3xl font-bold">{value}</p>
    </div>
  );
}
