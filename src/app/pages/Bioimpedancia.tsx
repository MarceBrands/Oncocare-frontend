import { Outlet } from 'react-router';
import { Scale, Droplet, TrendingUp, Activity } from 'lucide-react';
import { Card } from '../components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useState } from 'react';

const bioimpedanciaData = {
  current: {
    massaMagra: 42.5,
    gorduraCorporal: 32.8,
    hidratacao: 51.2,
    imc: 26.4,
    pesoTotal: 68.5,
  },
};

const evolutionData = [
  {
    month: 'Jan',
    massaMagra: 45.2,
    gordura: 28.5,
    hidratacao: 54.2,
    peso: 70.2,
  },
  {
    month: 'Fev',
    massaMagra: 44.8,
    gordura: 29.1,
    hidratacao: 53.5,
    peso: 69.8,
  },
  {
    month: 'Mar',
    massaMagra: 43.5,
    gordura: 30.8,
    hidratacao: 52.8,
    peso: 69.1,
  },
  {
    month: 'Abr',
    massaMagra: 43.0,
    gordura: 31.5,
    hidratacao: 52.0,
    peso: 68.9,
  },
  {
    month: 'Mai',
    massaMagra: 42.5,
    gordura: 32.8,
    hidratacao: 51.2,
    peso: 68.5,
  },
];

const imcData = [
  { month: 'Jan', imc: 27.2 },
  { month: 'Fev', imc: 27.0 },
  { month: 'Mar', imc: 26.8 },
  { month: 'Abr', imc: 26.7 },
  { month: 'Mai', imc: 26.4 },
];

const getImcCategory = (imc: number) => {
  if (imc < 18.5) return { text: 'Abaixo do peso', color: 'yellow' };
  if (imc < 25) return { text: 'Peso normal', color: 'green' };
  if (imc < 30) return { text: 'Sobrepeso', color: 'orange' };
  return { text: 'Obesidade', color: 'red' };
};

export function Bioimpedancia() {
  const [selectedPatient, setSelectedPatient] = useState('maria');

  const imcCategory = getImcCategory(bioimpedanciaData.current.imc);

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Bioimpedância e Composição Corporal
        </h1>
        <p className="text-gray-500 mt-2">
          Monitoramento da composição corporal durante o tratamento
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

      {/* Current Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6 bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
              <Activity className="size-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500">Massa Magra</p>
              <p className="text-2xl font-bold text-gray-900">
                {bioimpedanciaData.current.massaMagra}
                <span className="text-base font-normal text-gray-500 ml-1">
                  kg
                </span>
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-xl bg-gradient-to-br from-pink-500 to-pink-600 flex items-center justify-center">
              <TrendingUp className="size-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500">Gordura Corporal</p>
              <p className="text-2xl font-bold text-gray-900">
                {bioimpedanciaData.current.gorduraCorporal}
                <span className="text-base font-normal text-gray-500 ml-1">%</span>
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
              <Droplet className="size-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500">Hidratação</p>
              <p className="text-2xl font-bold text-gray-900">
                {bioimpedanciaData.current.hidratacao}
                <span className="text-base font-normal text-gray-500 ml-1">%</span>
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
              <Scale className="size-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-500">IMC</p>
              <p className="text-2xl font-bold text-gray-900">
                {bioimpedanciaData.current.imc}
              </p>
              <p className={`text-xs text-${imcCategory.color}-600 mt-1`}>
                {imcCategory.text}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Composition Evolution */}
        <Card className="p-6 bg-white border-0 shadow-lg rounded-2xl">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Evolução da Composição Corporal
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={evolutionData}>
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
              <Line
                type="monotone"
                dataKey="massaMagra"
                stroke="#a855f7"
                strokeWidth={3}
                name="Massa Magra (kg)"
                dot={{ fill: '#a855f7', r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="gordura"
                stroke="#ec4899"
                strokeWidth={3}
                name="Gordura (%)"
                dot={{ fill: '#ec4899', r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-4 p-3 bg-purple-50 rounded-xl">
            <p className="text-sm text-purple-700">
              Perda de 2.7 kg de massa magra nos últimos 5 meses. Considerar
              suplementação nutricional.
            </p>
          </div>
        </Card>

        {/* Hydration */}
        <Card className="p-6 bg-white border-0 shadow-lg rounded-2xl">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Evolução da Hidratação
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={evolutionData}>
              <defs>
                <linearGradient id="colorHidra" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#888" />
              <YAxis stroke="#888" domain={[40, 60]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                }}
              />
              <Area
                type="monotone"
                dataKey="hidratacao"
                stroke="#3b82f6"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorHidra)"
                name="Hidratação (%)"
              />
            </AreaChart>
          </ResponsiveContainer>
          <div className="mt-4 p-3 bg-blue-50 rounded-xl">
            <p className="text-sm text-blue-700">
              Nível de hidratação em 51.2% está dentro da faixa aceitável (50-60%).
            </p>
          </div>
        </Card>
      </div>

      {/* IMC and Weight */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 bg-white border-0 shadow-lg rounded-2xl">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Evolução do IMC
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={imcData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#888" />
              <YAxis stroke="#888" domain={[20, 30]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                }}
              />
              <Bar
                dataKey="imc"
                fill="#10b981"
                name="IMC"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 p-3 bg-green-50 rounded-xl">
            <p className="text-sm text-green-700">
              IMC atual de 26.4 está na categoria de sobrepeso. Meta: manter entre
              18.5 e 24.9.
            </p>
          </div>
        </Card>

        <Card className="p-6 bg-white border-0 shadow-lg rounded-2xl">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Evolução do Peso Total
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={evolutionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#888" />
              <YAxis stroke="#888" domain={[65, 75]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                }}
              />
              <Line
                type="monotone"
                dataKey="peso"
                stroke="#10b981"
                strokeWidth={3}
                name="Peso (kg)"
                dot={{ fill: '#10b981', r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-4 p-3 bg-amber-50 rounded-xl">
            <p className="text-sm text-amber-700">
              Perda de 1.7 kg (2.4%) nos últimos 5 meses. Monitorar para evitar
              perda excessiva.
            </p>
          </div>
        </Card>
      </div>

      <Outlet />
    </>
  );
}
