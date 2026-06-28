import { Navigate } from "react-router-dom";
import { getUsuarioLogado } from "../services/auth";
import type { Perfil } from "../types/user";

interface PrivateRouteProps {
  children: React.ReactNode;
  allowedProfiles?: Perfil[];
}

export default function PrivateRoute({
  children,
  allowedProfiles,
}: PrivateRouteProps) {
  const usuario = getUsuarioLogado();

  if (!usuario) {
    return <Navigate to="/login" />;
  }

  if (allowedProfiles && !allowedProfiles.includes(usuario.perfil)) {
    return <Navigate to="/dashboard" />;
  }

  return <>{children}</>;
}