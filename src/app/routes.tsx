import { createBrowserRouter } from "react-router";
import { Dashboard } from "./pages/Dashboard";
import { Pacientes } from "./pages/Pacientes";
import { NovoPaciente } from "./pages/NovoPaciente";
import { PerfilPaciente } from "./pages/PerfilPaciente";
import { Tratamentos } from "./pages/Tratamentos";
import { Exames } from "./pages/Exames";
import { Sintomas } from "./pages/Sintomas";
import { Bioimpedancia } from "./pages/Bioimpedancia";
import { Apresentacao } from "./pages/Apresentacao";
import { Configuracoes } from "./pages/Configuracoes";
import { PacienteCheckin } from "./pages/PacienteCheckin";
import { PacienteDados } from "./pages/PacienteDados";
import { PacienteExames } from "./pages/PacienteExames";
import { PacientePortal } from "./pages/PacientePortal";
import { Layout } from "./components/Layout";

export const router = createBrowserRouter([
  { path: "/apresentacao", Component: Apresentacao },
  { path: "/paciente", Component: PacientePortal },
  { path: "/paciente/checkin", Component: PacienteCheckin },
  { path: "/paciente/dados", Component: PacienteDados },
  { path: "/paciente/exames", Component: PacienteExames },
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: "pacientes", Component: Pacientes },
      { path: "pacientes/novo", Component: NovoPaciente },
      { path: "pacientes/:id/editar", Component: NovoPaciente },
      { path: "pacientes/:id", Component: PerfilPaciente },
      { path: "tratamentos", Component: Tratamentos },
      { path: "exames", Component: Exames },
      { path: "sintomas", Component: Sintomas },
      { path: "bioimpedancia", Component: Bioimpedancia },
      { path: "configuracoes", Component: Configuracoes },
    ],
  },
]);
