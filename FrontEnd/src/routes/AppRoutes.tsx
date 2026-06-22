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

        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/usuarios" element={<Usuarios />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;