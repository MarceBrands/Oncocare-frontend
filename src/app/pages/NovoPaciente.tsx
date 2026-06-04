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

export function NovoPaciente() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nomeCompleto: '',
    cpf: '',
    dataNascimento: '',
    cancerMama: false,
    cancerColoUtero: false,
    menopausa: '',
    cicloMenstrual: '',
    observacoes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock save
    console.log('Salvando paciente:', formData);
    navigate('/pacientes');
  };

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <Button
          variant="ghost"
          onClick={() => navigate('/pacientes')}
          className="mb-4 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
        >
          <ArrowLeft className="size-5 mr-2" />
          Voltar para Pacientes
        </Button>
        <h1 className="text-3xl font-bold text-gray-900">Nova Paciente</h1>
        <p className="text-gray-500 mt-2">
          Cadastre uma nova paciente no sistema
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="p-8 bg-white border-0 shadow-lg rounded-2xl">
          <div className="space-y-6">
            {/* Dados Pessoais */}
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
                    className="mt-2 rounded-xl"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="cpf">CPF *</Label>
                  <Input
                    id="cpf"
                    value={formData.cpf}
                    onChange={(e) =>
                      setFormData({ ...formData, cpf: e.target.value })
                    }
                    placeholder="000.000.000-00"
                    className="mt-2 rounded-xl"
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
                    className="mt-2 rounded-xl"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Diagnóstico */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                Tipo de Câncer
              </h2>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-4 rounded-xl border border-gray-200 hover:bg-pink-50 transition-colors">
                  <Checkbox
                    id="cancerMama"
                    checked={formData.cancerMama}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, cancerMama: checked as boolean })
                    }
                  />
                  <Label
                    htmlFor="cancerMama"
                    className="flex-1 cursor-pointer font-medium"
                  >
                    Câncer de Mama
                  </Label>
                </div>

                <div className="flex items-center space-x-3 p-4 rounded-xl border border-gray-200 hover:bg-purple-50 transition-colors">
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
                    Câncer de Colo do Útero
                  </Label>
                </div>
              </div>
            </div>

            {/* Informações Clínicas */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                Informações Clínicas
              </h2>
              <div className="space-y-6">
                <div>
                  <Label>Menopausa *</Label>
                  <RadioGroup
                    value={formData.menopausa}
                    onValueChange={(value) =>
                      setFormData({ ...formData, menopausa: value })
                    }
                    className="flex gap-4 mt-2"
                  >
                    <div className="flex items-center space-x-2 p-3 rounded-xl border border-gray-200 hover:bg-purple-50 transition-colors flex-1">
                      <RadioGroupItem value="sim" id="menopausa-sim" />
                      <Label
                        htmlFor="menopausa-sim"
                        className="cursor-pointer flex-1"
                      >
                        Sim
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 rounded-xl border border-gray-200 hover:bg-purple-50 transition-colors flex-1">
                      <RadioGroupItem value="nao" id="menopausa-nao" />
                      <Label
                        htmlFor="menopausa-nao"
                        className="cursor-pointer flex-1"
                      >
                        Não
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
                    placeholder="Ex: Regular, Irregular, Não se aplica"
                    className="mt-2 rounded-xl"
                  />
                </div>

                <div>
                  <Label htmlFor="observacoes">Observações Clínicas</Label>
                  <Textarea
                    id="observacoes"
                    value={formData.observacoes}
                    onChange={(e) =>
                      setFormData({ ...formData, observacoes: e.target.value })
                    }
                    placeholder="Informações adicionais relevantes sobre o caso..."
                    className="mt-2 rounded-xl min-h-32"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/pacientes')}
              className="rounded-xl"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 shadow-lg rounded-xl"
            >
              <Save className="size-5 mr-2" />
              Salvar Paciente
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}
