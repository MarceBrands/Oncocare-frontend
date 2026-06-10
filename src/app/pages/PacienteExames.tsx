import { Link } from 'react-router';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../components/ui/button';
import { PatientAvatar } from '../components/PatientAvatar';
import { Exames } from './Exames';

export function PacienteExames() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <Link to="/paciente" className="flex items-center gap-3">
            <PatientAvatar className="size-11" />
            <div>
              <p className="font-bold leading-tight">OncoCare</p>
              <p className="text-xs text-slate-500">Meus exames</p>
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

      <main className="mx-auto max-w-7xl px-5 py-8 lg:px-8">
        <Exames patientMode />
      </main>
    </div>
  );
}
