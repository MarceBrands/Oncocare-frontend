import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Save } from 'lucide-react';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { Checkbox } from '../components/ui/checkbox';
import { Textarea } from '../components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { supabase } from '../../lib/supabase';

export function NovoPaciente() {
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nomeCompleto: '',
    cpf: '',
    dataNascimento: '',
    tipoAtendimento: 'SUS',
    cancerMama: false,
    cancerColoUtero: false,
    menopausa: '',
    cicloMenstrual: '',
    observacoes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    const { data: patient, error: patientError } = await supabase
      .from('pacientes')
      .insert({
        nome: formData.nomeCompleto.trim(),
        cpf: formData.cpf.trim(),
        data_nascimento: formData.dataNascimento,
        tipo_atendimento: formData.tipoAtendimento,
      })
      .select('id')
      .single();

    if (patientError || !patient) {
      setError(patientError?.message ?? 'Nao foi possivel salvar a paciente.');
      setIsSaving(false);
      return;
    }

    const diagnoses = [
      formData.cancerMama ? 'mama' : null,
      formData.cancerColoUtero ? 'colo_utero' : null,
    ].filter(Boolean);

    if (diagnoses.length > 0) {
      const { error: diagnosisError } = await supabase.from('paciente_diagnosticos').insert(
        diagnoses.map((tipoCancer) => ({
          paciente_id: patient.id,
          tipo_cancer: tipoCancer,
          observacoes: formData.observacoes.trim() || null,
        }))
      );

      if (diagnosisError) {
        setError(
          `Paciente salva, mas o diagnostico nao foi salvo: ${diagnosisError.message}`
        );
        setIsSaving(false);
        return;
      }
    }

    navigate('/pacientes');
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/pacientes')}
          className="mb-4 text-cyan-700 hover:text-cyan-800 hover:bg-cyan-50"
        >
          <ArrowLeft className="size-5 mr-2" />
          Voltar para Pacientes
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">Nova Paciente</h1>
        <p className="text-gray-500 mt-2">Cadastre uma nova paciente no sistema</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="p-8 bg-white border border-slate-200 shadow-sm rounded-lg">
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                Dados Pessoais
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <Label htmlFor="nomeCompleto">Nome Completo *</Label>
                  <Input
                    id="nomeCompleto"
                    value={formData.nomeCompleto}
                    onChange={(e) =>
                      setFormData({ ...formData, nomeCompleto: e.target.value })
                    }
                    placeholder="Digite o nome completo"
                    className="mt-2 rounded-lg"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="cpf">CPF *</Label>
                  <Input
                    id="cpf"
                    value={formData.cpf}
                    onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                    placeholder="000.000.000-00"
                    className="mt-2 rounded-lg"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="dataNascimento">Data de Nascimento *</Label>
                  <Input
                    id="dataNascimento"
                    type="date"
                    value={formData.dataNascimento}
                    onChange={(e) =>
                      setFormData({ ...formData, dataNascimento: e.target.value })
                    }
                    className="mt-2 rounded-lg"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <Label>Tipo de Atendimento *</Label>
                  <Select
                    value={formData.tipoAtendimento}
                    onValueChange={(value) =>
                      setFormData({ ...formData, tipoAtendimento: value })
                    }
                  >
                    <SelectTrigger className="mt-2 rounded-lg">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SUS">SUS</SelectItem>
                      <SelectItem value="Clinica privada">Clinica privada</SelectItem>
                      <SelectItem value="Particular">Particular</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                Tipo de Cancer
              </h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 hover:bg-cyan-50 transition-colors">
                  <Checkbox
                    id="cancerMama"
                    checked={formData.cancerMama}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, cancerMama: checked as boolean })
                    }
                  />
                  <Label htmlFor="cancerMama" className="flex-1 cursor-pointer font-medium">
                    Cancer de Mama
                  </Label>
                </div>

                <div className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 hover:bg-cyan-50 transition-colors">
                  <Checkbox
                    id="cancerColoUtero"
                    checked={formData.cancerColoUtero}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        cancerColoUtero: checked as boolean,
                      })
                    }
                  />
                  <Label
                    htmlFor="cancerColoUtero"
                    className="flex-1 cursor-pointer font-medium"
                  >
                    Cancer de Colo do Utero
                  </Label>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                Informacoes Clinicas
              </h2>
              <div className="space-y-6">
                <div>
                  <Label>Menopausa</Label>
                  <RadioGroup
                    value={formData.menopausa}
                    onValueChange={(value) => setFormData({ ...formData, menopausa: value })}
                    className="flex gap-4 mt-2"
                  >
                    <div className="flex items-center space-x-2 p-3 rounded-lg border border-gray-200 hover:bg-cyan-50 transition-colors flex-1">
                      <RadioGroupItem value="sim" id="menopausa-sim" />
                      <Label htmlFor="menopausa-sim" className="cursor-pointer flex-1">
                        Sim
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 rounded-lg border border-gray-200 hover:bg-cyan-50 transition-colors flex-1">
                      <RadioGroupItem value="nao" id="menopausa-nao" />
                      <Label htmlFor="menopausa-nao" className="cursor-pointer flex-1">
                        Nao
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label htmlFor="cicloMenstrual">Ciclo Menstrual</Label>
                  <Input
                    id="cicloMenstrual"
                    value={formData.cicloMenstrual}
                    onChange={(e) =>
                      setFormData({ ...formData, cicloMenstrual: e.target.value })
                    }
                    placeholder="Ex: Regular, irregular, nao se aplica"
                    className="mt-2 rounded-lg"
                  />
                </div>

                <div>
                  <Label htmlFor="observacoes">Observacoes Clinicas</Label>
                  <Textarea
                    id="observacoes"
                    value={formData.observacoes}
                    onChange={(e) =>
                      setFormData({ ...formData, observacoes: e.target.value })
                    }
                    placeholder="Informacoes adicionais relevantes sobre o caso..."
                    className="mt-2 rounded-lg min-h-32"
                  />
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/pacientes')}
              className="rounded-lg"
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-cyan-700 hover:bg-cyan-800 shadow-sm rounded-lg"
              disabled={isSaving}
            >
              <Save className="size-5 mr-2" />
              {isSaving ? 'Salvando...' : 'Salvar Paciente'}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}
