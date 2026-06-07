import { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router';
import {
  LayoutDashboard,
  Users,
  Activity,
  FileText,
  ClipboardList,
  BarChart3,
  Settings,
  Menu,
  ShieldCheck,
  HeartPulse,
} from 'lucide-react';
import { cn } from './ui/utils';

const navigation = [
  { name: 'Painel clinico', href: '/', icon: LayoutDashboard },
  { name: 'Pacientes', href: '/pacientes', icon: Users },
  { name: 'Tratamentos', href: '/tratamentos', icon: Activity },
  { name: 'Exames', href: '/exames', icon: FileText },
  { name: 'Avaliacoes', href: '/sintomas', icon: ClipboardList },
  { name: 'Indicadores', href: '/bioimpedancia', icon: BarChart3 },
  { name: 'Configuracoes', href: '#', icon: Settings },
];

export function Layout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      <div
        className={cn(
          'fixed inset-0 z-50 bg-slate-950/50 transition-opacity lg:hidden',
          sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={() => setSidebarOpen(false)}
      >
        <div
          className={cn(
            'fixed inset-y-0 left-0 w-72 bg-white shadow-2xl transition-transform duration-300',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <SidebarContent location={location} onNavigate={() => setSidebarOpen(false)} />
        </div>
      </div>

      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
        <SidebarContent location={location} />
      </div>

      <div className="lg:pl-72">
        <div className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-slate-200 bg-white/95 px-4 shadow-sm lg:px-8">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-slate-700 lg:hidden"
            aria-label="Abrir menu"
          >
            <Menu className="size-6" />
          </button>
          <div className="flex flex-1 items-center gap-2 text-sm text-slate-600">
            <ShieldCheck className="size-4 text-emerald-700" />
            <span className="hidden sm:inline">Acesso profissional com registro LGPD</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-slate-900">Dra. Ana Silva</p>
              <p className="text-xs text-slate-500">Oncologista</p>
            </div>
            <div className="size-10 rounded-full bg-slate-800 flex items-center justify-center text-white font-semibold">
              AS
            </div>
          </div>
        </div>

        <main className="py-8 px-4 lg:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function SidebarContent({
  location,
  onNavigate,
}: {
  location: ReturnType<typeof useLocation>;
  onNavigate?: () => void;
}) {
  return (
    <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white border-r border-slate-200 px-6 py-8">
      <div className="flex items-center gap-3">
        <div className="size-10 rounded-lg bg-cyan-700 flex items-center justify-center">
          <HeartPulse className="size-6 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-950">OncoCare</h1>
          <p className="text-xs text-slate-500">Plataforma clinica</p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-2 mt-8">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={onNavigate}
              className={cn(
                'flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-cyan-700 text-white shadow-sm'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950'
              )}
            >
              <item.icon className="size-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-4 border-t border-slate-200">
        <div className="rounded-lg bg-slate-50 p-4 border border-slate-200">
          <p className="text-xs font-medium text-slate-900">
            Continuidade do cuidado oncologico
          </p>
          <p className="text-xs text-slate-600 mt-1">
            SUS, clinicas privadas e cuidado particular em uma unica plataforma.
          </p>
        </div>
      </div>
    </div>
  );
}
