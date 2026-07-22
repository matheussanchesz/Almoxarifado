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
import DetalhesDemanda from "../pages/DetalhesDemanda/DetalhesDemanda";
import Almoxarifado from "../pages/Almoxarifado/Almoxarifado";
import Checklists from "../pages/Checklists/Checklists";
import ExecucaoChecklist from "../pages/ExecucaoChecklist/ExecucaoChecklist";
import HistoricoChecklists from "../pages/HistoricoChecklists/HistoricoChecklists";
import VisualizarChecklist from "../pages/VisualizarChecklist/VisualizarChecklist";
import Compras from "../pages/Compras/Compras";
import NovaCompra from "../pages/NovaCompra/NovaCompra";
import DetalhesCompra from "../pages/DetalhesCompra/DetalhesCompra";
import Notificacoes from "../pages/Notificacoes/Notificacoes";
import Relatorios from "../pages/Relatorios/Relatorios";

import PrivateRoute from "./PrivateRoute";
import { perfisPermitidos } from "../services/permissoes";

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
          path="/relatorios"
          element={
            <PrivateRoute
              allowedProfiles={["Desenvolvedor", "Admin", "Coordenador", "Professor", "Almoxarife", "Almoxarifado"]}
            >
              <Relatorios />
            </PrivateRoute>
          }
        />

        <Route
          path="/notificacoes"
          element={
            <PrivateRoute
              allowedProfiles={["Desenvolvedor", "Admin", "Professor", "Almoxarife", "Almoxarifado", "Coordenador"]}
            >
              <Notificacoes />
            </PrivateRoute>
          }
        />

        <Route
          path="/usuarios"
          element={
            <PrivateRoute allowedProfiles={["Desenvolvedor", "Admin", "Coordenador"]}>
              <Usuarios />
            </PrivateRoute>
          }
        />

        <Route
          path="/nova-demanda"
          element={
            <PrivateRoute allowedProfiles={perfisPermitidos("novaDemanda")}>
              <NovaDemanda />
            </PrivateRoute>
          }
        />

        <Route
          path="/demandas"
          element={
            <PrivateRoute
              allowedProfiles={["Desenvolvedor", "Admin", "Professor", "Almoxarife", "Almoxarifado", "Coordenador"]}
            >
              <Demandas />
            </PrivateRoute>
          }
        />

        <Route
          path="/demandas/detalhes/:id"
          element={
            <PrivateRoute
              allowedProfiles={["Desenvolvedor", "Admin", "Coordenador", "Professor", "Almoxarife", "Almoxarifado"]}
            >
              <DetalhesDemanda />
            </PrivateRoute>
          }
        />

        <Route
          path="/almoxarifado"
          element={
            <PrivateRoute allowedProfiles={["Desenvolvedor", "Admin", "Coordenador", "Almoxarife", "Almoxarifado"]}>
              <Almoxarifado />
            </PrivateRoute>
          }
        />

        <Route
          path="/checklists"
          element={
            <PrivateRoute allowedProfiles={perfisPermitidos("novaCompra")}>
              <Checklists />
            </PrivateRoute>
          }
        />

        <Route
          path="/checklists/execucao/:id"
          element={
            <PrivateRoute allowedProfiles={["Desenvolvedor", "Admin", "Almoxarife", "Almoxarifado"]}>
              <ExecucaoChecklist />
            </PrivateRoute>
          }
        />

        <Route
          path="/checklists/historico"
          element={
            <PrivateRoute allowedProfiles={["Desenvolvedor", "Admin", "Coordenador", "Almoxarife", "Almoxarifado"]}>
              <HistoricoChecklists />
            </PrivateRoute>
          }
        />

        <Route
          path="/checklists/visualizar/:id"
          element={
            <PrivateRoute allowedProfiles={["Desenvolvedor", "Admin", "Coordenador", "Almoxarife", "Almoxarifado"]}>
              <VisualizarChecklist />
            </PrivateRoute>
          }
        />

        <Route
          path="/compras"
          element={
            <PrivateRoute allowedProfiles={["Desenvolvedor", "Admin", "Coordenador", "Almoxarife", "Almoxarifado"]}>
              <Compras />
            </PrivateRoute>
          }
        />

        <Route
          path="/compras/nova"
          element={
            <PrivateRoute allowedProfiles={["Desenvolvedor", "Admin", "Almoxarife", "Almoxarifado"]}>
              <NovaCompra />
            </PrivateRoute>
          }
        />

        <Route
          path="/compras/detalhes/:id"
          element={
            <PrivateRoute allowedProfiles={["Desenvolvedor", "Admin", "Coordenador", "Almoxarife", "Almoxarifado"]}>
              <DetalhesCompra />
            </PrivateRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
