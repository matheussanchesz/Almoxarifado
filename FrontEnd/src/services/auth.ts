import { api } from "./api";
import type { UsuarioLogado } from "../types/user";

const USUARIO_KEY = "@senai:user";
const TOKEN_KEY = "@senai:token";

interface LoginResponse {
  mensagem: string;
  token: string;
  usuario: UsuarioLogado;
  precisaCompletarCadastro?: boolean;
}

export async function login(matricula: string, dataNascimento: string) {
  const response = await api.post<LoginResponse>("/Auth/login", {
    matricula,
    dataNascimento,
  });

  localStorage.setItem(TOKEN_KEY, response.data.token);
  localStorage.setItem(USUARIO_KEY, JSON.stringify(response.data.usuario));

  return response.data;
}

export async function completarCadastro(
  matricula: string,
  dataNascimento: string,
  email: string,
  telefone: string,
  setor: string,
) {
  const response = await api.post<LoginResponse>("/Auth/completar-cadastro", {
    matricula,
    dataNascimento,
    email,
    telefone,
    setor,
  });

  localStorage.setItem(TOKEN_KEY, response.data.token);
  localStorage.setItem(USUARIO_KEY, JSON.stringify(response.data.usuario));

  return response.data;
}

export async function recuperarAcesso(identificador: string) {
  const response = await api.post<{ mensagem: string; email?: string }>(
    "/Auth/recuperar-acesso",
    { identificador },
  );

  return response.data;
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
