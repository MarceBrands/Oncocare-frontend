import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase environment variables are missing.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type PacienteRow = {
  id: string;
  nome: string;
  data_nascimento: string;
  cpf: string;
  medico_id: string | null;
  created_at: string | null;
  usuario_perfil_id: string | null;
  cadastrado_por_medico_id: string | null;
  updated_at: string | null;
  tipo_atendimento: string;
  tipo_atendimento_id: number | null;
  paciente_diagnosticos?: Array<{
    tipo_cancer: 'mama' | 'colo_utero';
  }>;
};
