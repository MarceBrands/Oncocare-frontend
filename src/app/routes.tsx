import { createBrowserRouter } from "react-router";
import { Dashboard } from "./pages/Dashboard";
import { Pacientes } from "./pages/Pacientes";
import { NovoPaciente } from "./pages/NovoPaciente";
import { PerfilPaciente } from "./pages/PerfilPaciente";
import { Tratamentos } from "./pages/Tratamentos";
import { Exames } from "./pages/Exames";
import { Sintomas } from "./pages/Sintomas";
import { Bioimpedancia } from "./pages/Bioimpedancia";
import { Layout } from "./components/Layout";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: "pacientes", Component: Pacientes },
      { path: "pacientes/novo", Component: NovoPaciente },
      { path: "pacientes/:id", Component: PerfilPaciente },
      { path: "tratamentos", Component: Tratamentos },
      { path: "exames", Component: Exames },
      { path: "sintomas", Component: Sintomas },
      { path: "bioimpedancia", Component: Bioimpedancia },
    ],
  },
]);
