import { Outlet } from 'react-router';
import { Save, ShieldCheck, UserRound } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';

export function Configuracoes() {
  return (
    <>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-950">Configuracoes</h1>
        <p className="mt-2 max-w-3xl text-slate-600">
          Dados de cadastro do usuario logado, organizados conforme as colunas principais do banco.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-6">
          <Card className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-cyan-700 text-white">
                <UserRound className="size-5" />
              </div>
              <div>
                <h2 className="font-semibold text-slate-950">Perfil do usuario</h2>
                <p className="text-sm text-slate-500">Tabela usuarios_perfis</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Nome" placeholder="Nome completo" />
              <Field label="CPF" placeholder="000.000.000-00" />
              <div>
                <Label>Tipo de usuario</Label>
                <Select defaultValue="profissional_saude">
                  <SelectTrigger className="mt-2 rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="profissional_saude">Profissional de saude</SelectItem>
                    <SelectItem value="paciente">Paciente</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Field label="ID de autenticacao" placeholder="Preenchido pelo login" disabled />
            </div>
          </Card>

          <Card className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-slate-800 text-white">
                <ShieldCheck className="size-5" />
              </div>
              <div>
                <h2 className="font-semibold text-slate-950">Dados profissionais</h2>
                <p className="text-sm text-slate-500">Tabela medicos</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Field label="Nome profissional" placeholder="Nome usado no atendimento" />
              <Field label="Email" placeholder="email@clinica.com" />
              <Field label="Telefone" placeholder="(00) 00000-0000" />
              <Field label="Data de nascimento" type="date" />
              <Field label="CPF" placeholder="000.000.000-00" />
              <Field label="Matricula" placeholder="Numero interno da clinica" />
              <Field label="CBO" placeholder="Codigo Brasileiro de Ocupacoes" />
              <Field label="Especialidade" placeholder="Ex: Oncologia clinica" />
            </div>
          </Card>

          <div className="flex justify-end">
            <Button className="rounded-lg bg-cyan-700 hover:bg-cyan-800">
              <Save className="mr-2 size-4" />
              Salvar alteracoes
            </Button>
          </div>
        </div>

        <aside className="space-y-4">
          <Card className="rounded-lg border border-cyan-200 bg-cyan-50 p-5 shadow-sm">
            <p className="text-sm font-semibold text-cyan-950">Proximo passo tecnico</p>
            <p className="mt-2 text-sm text-cyan-800">
              Conectar este formulario ao Supabase Auth para saber qual medico ou paciente esta usando a conta.
            </p>
          </Card>
        </aside>
      </div>

      <Outlet />
    </>
  );
}

function Field({
  label,
  placeholder,
  type = 'text',
  disabled = false,
}: {
  label: string;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <Input
        disabled={disabled}
        type={type}
        placeholder={placeholder}
        className="mt-2 rounded-lg"
      />
    </div>
  );
}
