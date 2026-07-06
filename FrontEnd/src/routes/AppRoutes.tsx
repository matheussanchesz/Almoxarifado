import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import Login from "../pages/Login/Login";
import PrimeiroAcesso from "../pages/PrimeiroAcesso/PrimeiroAcesso";
import RecuperarAcesso from "../pages/RecuperarAcesso/RecuperarAcesso";
import EmailEnviado from "../pages/EmailEnviado/EmailEnviado";
import AtualizarSenha from "../pages/AtualizarSenha/AtualizarSenha";
import SenhaRedefinida from "../pages/SenhaRedefinida/SenhaRedefinida";
import SuporteAcesso from "../pages/SuporteAcesso/SuporteAcesso";

import Dashboard from "../pages/Dashboard/Dashboard";
import Usuarios from "../pages/Usuarios/Usuarios";
import NovaDemanda from "../pages/NovaDemanda/NovaDemanda";
import Demandas from "../pages/Demandas/Demandas";
import Almoxarifado from "../pages/Almoxarifado/Almoxarifado";
import Checklists from "../pages/Checklists/Checklists";
import ExecucaoChecklist from "../pages/ExecucaoChecklist/ExecucaoChecklist";

import PrivateRoute from "./PrivateRoute";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />

        <Route path="/login" element={<Login />} />
        <Route path="/primeiro-acesso" element={<PrimeiroAcesso />} />
        <Route path="/recuperar-acesso" element={<RecuperarAcesso />} />
        <Route path="/email-enviado" element={<EmailEnviado />} />
        <Route path="/atualizar-senha" element={<AtualizarSenha />} />
        <Route path="/senha-redefinida" element={<SenhaRedefinida />} />
        <Route path="/suporte-acesso" element={<SuporteAcesso />} />

        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/usuarios"
          element={
            <PrivateRoute allowedProfiles={["Admin", "Coordenador"]}>
              <Usuarios />
            </PrivateRoute>
          }
        />

        <Route
          path="/nova-demanda"
          element={
            <PrivateRoute allowedProfiles={["Professor"]}>
              <NovaDemanda />
            </PrivateRoute>
          }
        />

        <Route
          path="/demandas"
          element={
            <PrivateRoute
              allowedProfiles={[
                "Admin",
                "Professor",
                "Almoxarife",
                "Coordenador",
              ]}
            >
              <Demandas />
            </PrivateRoute>
          }
        />

        <Route
  path="/almoxarifado"
  element={
    <PrivateRoute allowedProfiles={["Admin", "Coordenador", "Almoxarife"]}>
      <Almoxarifado />
    </PrivateRoute>
  }
/>

<Route
  path="/checklists"
  element={
    <PrivateRoute allowedProfiles={["Admin", "Almoxarife"]}>
      <Checklists />
    </PrivateRoute>
  }
/>

<Route
  path="/checklists/execucao/:id"
  element={
    <PrivateRoute allowedProfiles={["Admin", "Almoxarife"]}>
      <ExecucaoChecklist />
    </PrivateRoute>
  }
/>
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
