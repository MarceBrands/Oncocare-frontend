import { ReactNode, useState } from 'react';
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
  X,
  Heart,
} from 'lucide-react';
import { cn } from './ui/utils';

interface LayoutProps {
  children: ReactNode;
}

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Pacientes', href: '/pacientes', icon: Users },
  { name: 'Tratamentos', href: '/tratamentos', icon: Activity },
  { name: 'Exames', href: '/exames', icon: FileText },
  { name: 'Avaliações', href: '/sintomas', icon: ClipboardList },
  { name: 'Relatórios', href: '/bioimpedancia', icon: BarChart3 },
  { name: 'Configurações', href: '#', icon: Settings },
];

export function Layout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      {/* Mobile sidebar */}
      <div
        className={cn(
          'fixed inset-0 z-50 bg-black/50 transition-opacity lg:hidden',
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

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
        <SidebarContent location={location} />
      </div>

      {/* Main content */}
      <div className="lg:pl-72">
        <div className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-purple-100 bg-white/80 backdrop-blur-sm px-4 shadow-sm lg:px-8">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-purple-600 lg:hidden"
          >
            <Menu className="size-6" />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-900">Dra. Ana Silva</p>
              <p className="text-xs text-gray-500">Oncologista</p>
            </div>
            <div className="size-10 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-semibold">
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
    <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white border-r border-purple-100 px-6 py-8">
      <div className="flex items-center gap-3">
        <div className="size-10 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
          <Heart className="size-6 text-white" fill="white" />
        </div>
        <div>
          <h1 className="text-lg font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            OncoSUS
          </h1>
          <p className="text-xs text-gray-500">Cuidado Oncológico</p>
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
                'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg shadow-purple-500/30'
                  : 'text-gray-700 hover:bg-purple-50 hover:text-purple-700'
              )}
            >
              <item.icon className="size-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-4 border-t border-purple-100">
        <div className="rounded-xl bg-gradient-to-br from-pink-100 to-purple-100 p-4">
          <p className="text-xs font-medium text-purple-900">
            Sistema de Acompanhamento Oncológico
          </p>
          <p className="text-xs text-purple-700 mt-1">SUS Digital</p>
        </div>
      </div>
    </div>
  );
}