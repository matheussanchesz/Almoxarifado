import { api } from "./api";
import type { UsuarioLogado } from "../types/user";

const USUARIO_KEY = "@senai:user";
const TOKEN_KEY = "@senai:token";

interface LoginResponse {
  mensagem: string;
  token: string;
  usuario: UsuarioLogado;
}

export async function login(matricula: string, dataNascimento: string) {
  const response = await api.post<LoginResponse>("/Auth/login", {
    matricula,
    dataNascimento,
  });

  localStorage.setItem(TOKEN_KEY, response.data.token);
  localStorage.setItem(USUARIO_KEY, JSON.stringify(response.data.usuario));

  return response.data.usuario;
}

export function getUsuarioLogado(): UsuarioLogado | null {
  const user = localStorage.getItem(USUARIO_KEY);

  if (!user) {
    return null;
  }

  try {
    return JSON.parse(user) as UsuarioLogado;
  } catch {
    logout();
    return null;
  }
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USUARIO_KEY);
}
