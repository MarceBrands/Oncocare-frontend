import { useState } from 'react';
import { Outlet } from 'react-router';
import {
  Heart,
  Brain,
  Activity,
  Moon,
  Smile,
  Frown,
  Meh,
} from 'lucide-react';
import { Card } from '../components/ui/card';
import { Slider } from '../components/ui/slider';
import { Button } from '../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

interface Symptom {
  id: string;
  name: string;
  value: number;
  icon: any;
  color: string;
}

const symptomsList: Symptom[] = [
  { id: 'fadiga', name: 'Fadiga', value: 9, icon: Activity, color: '#ec4899' },
  { id: 'dor', name: 'Dor', value: 8, icon: Heart, color: '#ef4444' },
  { id: 'nausea', name: 'Náusea', value: 7, icon: Frown, color: '#f59e0b' },
  { id: 'sono', name: 'Qualidade do Sono', value: 4, icon: Moon, color: '#8b5cf6' },
  {
    id: 'ansiedade',
    name: 'Ansiedade',
    value: 9,
    icon: Brain,
    color: '#06b6d4',
  },
  {
    id: 'funcionalidade',
    name: 'Funcionalidade Física',
    value: 3,
    icon: Activity,
    color: '#10b981',
  },
];

const radarData = [
  { subject: 'Fadiga', value: 9, fullMark: 10 },
  { subject: 'Dor', value: 8, fullMark: 10 },
  { subject: 'Náusea', value: 7, fullMark: 10 },
  { subject: 'Sono', value: 4, fullMark: 10 },
  { subject: 'Ansiedade', value: 9, fullMark: 10 },
  { subject: 'Física', value: 3, fullMark: 10 },
];

const evolutionData = [
  { month: 'Jan', fadiga: 7, dor: 5, nausea: 3, ansiedade: 6, sono: 6 },
  { month: 'Fev', fadiga: 6, dor: 6, nausea: 4, ansiedade: 7, sono: 5 },
  { month: 'Mar', fadiga: 8, dor: 7, nausea: 6, ansiedade: 8, sono: 4 },
  { month: 'Abr', fadiga: 7, dor: 6, nausea: 5, ansiedade: 6, sono: 5 },
  { month: 'Mai', fadiga: 9, dor: 8, nausea: 7, ansiedade: 9, sono: 4 },
];

const qualityOfLifeScore = 3.2; // 0-10 scale

export function Sintomas() {
  const [selectedPatient, setSelectedPatient] = useState('maria');
  const [symptoms, setSymptoms] = useState(symptomsList);

  const handleSymptomChange = (id: string, value: number[]) => {
    setSymptoms(
      symptoms.map((s) => (s.id === id ? { ...s, value: value[0] } : s))
    );
  };

  const getQualityColor = (score: number) => {
    if (score >= 7) return 'from-green-500 to-green-600';
    if (score >= 4) return 'from-yellow-500 to-yellow-600';
    return 'from-red-500 to-red-600';
  };

  const getQualityText = (score: number) => {
    if (score >= 7) return 'Boa';
    if (score >= 4) return 'Moderada';
    return 'Baixa';
  };

  const getQualityIcon = (score: number) => {
    if (score >= 7) return Smile;
    if (score >= 4) return Meh;
    return Frown;
  };

  const QualityIcon = getQualityIcon(qualityOfLifeScore);

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Sintomas e Qualidade de Vida
        </h1>
        <p className="text-gray-500 mt-2">
          Avaliação baseada em questionários EORTC
        </p>
      </div>

      {/* Patient Selector */}
      <Card className="p-4 bg-white border-0 shadow-lg rounded-2xl mb-6">
        <div className="flex items-center gap-4">
          <p className="text-sm font-medium text-gray-700">Paciente:</p>
          <Select value={selectedPatient} onValueChange={setSelectedPatient}>
            <SelectTrigger className="w-64 rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="maria">Maria Santos Silva</SelectItem>
              <SelectItem value="ana">Ana Paula Oliveira</SelectItem>
              <SelectItem value="juliana">Juliana Costa</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Quality of Life Score */}
      <Card className="p-8 bg-gradient-to-br from-purple-50 to-pink-50 border-0 shadow-lg rounded-2xl mb-6">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1 text-center md:text-left">
            <p className="text-sm text-gray-600 mb-2">
              Score Geral de Qualidade de Vida
            </p>
            <div className="flex items-baseline gap-2 justify-center md:justify-start">
              <span className="text-6xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {qualityOfLifeScore.toFixed(1)}
              </span>
              <span className="text-2xl text-gray-500">/10</span>
            </div>
            <p className="text-lg font-medium text-gray-700 mt-2">
              Qualidade de Vida: {getQualityText(qualityOfLifeScore)}
            </p>
          </div>
          <div
            className={`size-32 rounded-3xl bg-gradient-to-br ${getQualityColor(
              qualityOfLifeScore
            )} flex items-center justify-center shadow-2xl`}
          >
            <QualityIcon className="size-16 text-white" />
          </div>
        </div>
      </Card>

      {/* Symptoms Assessment */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <Card className="p-6 bg-white border-0 shadow-lg rounded-2xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Avaliação de Sintomas
            </h3>
            <div className="space-y-8">
              {symptoms.map((symptom) => {
                const Icon = symptom.icon;
                return (
                  <div key={symptom.id}>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="size-10 rounded-xl flex items-center justify-center"
                          style={{ backgroundColor: `${symptom.color}20` }}
                        >
                          <Icon
                            className="size-5"
                            style={{ color: symptom.color }}
                          />
                        </div>
                        <span className="font-medium text-gray-900">
                          {symptom.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className="text-2xl font-bold"
                          style={{ color: symptom.color }}
                        >
                          {symptom.value}
                        </span>
                        <span className="text-gray-500">/10</span>
                      </div>
                    </div>
                    <Slider
                      value={[symptom.value]}
                      onValueChange={(value) =>
                        handleSymptomChange(symptom.id, value)
                      }
                      max={10}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                      <span>Nenhum</span>
                      <span>Moderado</span>
                      <span>Intenso</span>
                    </div>
                  </div>
                );
              })}
            </div>
            <Button className="w-full mt-8 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 shadow-lg rounded-xl">
              Salvar Avaliação
            </Button>
          </Card>
        </div>

        {/* Radar Chart */}
        <div>
          <Card className="p-6 bg-white border-0 shadow-lg rounded-2xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Perfil Multidimensional
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fill: '#6b7280', fontSize: 12 }}
                />
                <PolarRadiusAxis angle={90} domain={[0, 10]} />
                <Radar
                  name="Sintomas"
                  dataKey="value"
                  stroke="#a855f7"
                  fill="#a855f7"
                  fillOpacity={0.6}
                />
              </RadarChart>
            </ResponsiveContainer>
            <div className="mt-4 p-3 bg-purple-50 rounded-xl">
              <p className="text-xs text-purple-700">
                Valores mais altos indicam maior intensidade de sintomas e maior
                impacto na qualidade de vida.
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* Evolution Chart */}
      <Card className="p-6 bg-white border-0 shadow-lg rounded-2xl">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Evolução Temporal dos Sintomas
        </h3>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={evolutionData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" stroke="#888" />
            <YAxis stroke="#888" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: 'none',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }}
            />
            <Legend />
            <Bar
              dataKey="fadiga"
              fill="#ec4899"
              name="Fadiga"
              radius={[8, 8, 0, 0]}
            />
            <Bar dataKey="dor" fill="#ef4444" name="Dor" radius={[8, 8, 0, 0]} />
            <Bar
              dataKey="nausea"
              fill="#f59e0b"
              name="Náusea"
              radius={[8, 8, 0, 0]}
            />
            <Bar
              dataKey="ansiedade"
              fill="#06b6d4"
              name="Ansiedade"
              radius={[8, 8, 0, 0]}
            />
            <Bar
              dataKey="sono"
              fill="#8b5cf6"
              name="Sono"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-4 p-4 bg-amber-50 rounded-xl">
          <p className="text-sm text-amber-700">
            <strong>Observação:</strong> Aumento significativo de fadiga (28%) e
            ansiedade (33%) no último mês. Considerar ajustes no plano de cuidados.
          </p>
        </div>
      </Card>

      <Outlet />
    </>
  );
}
