// LOGIN LOCAL TEMPORÁRIO
// Remover quando o Firestore/Firebase estiver disponível.
// Depois substituir por api.post("/Auth/login").
//  import { api } from "./api";
// import type { UsuarioLogado } from "../types/user";

// interface LoginResponse {
//   mensagem: string;
//   token: string;
//   usuario: UsuarioLogado;
// }

// export async function login(matricula: string, dataNascimento: string) {
//   const response = await api.post<LoginResponse>("/Auth/login", {
//     matricula,
//     dataNascimento,
//   });

//   localStorage.setItem("@senai:token", response.data.token);
//   localStorage.setItem("@senai:user", JSON.stringify(response.data.usuario));

//   return response.data.usuario;
// }

// export function getUsuarioLogado(): UsuarioLogado | null {
//   const user = localStorage.getItem("@senai:user");
//   return user ? JSON.parse(user) : null;
// }

// export function logout() {
//   localStorage.removeItem("@senai:token");
//   localStorage.removeItem("@senai:user");
// }

import type { Perfil, UsuarioLogado } from "../types/user";

const USUARIO_KEY = "@senai:user";
const TOKEN_KEY = "@senai:token";

const usuariosLocais: Array<UsuarioLogado & { dataNascimento: string }> = [
  {
    nome: "Joana Costa",
    matricula: "12345",
    perfil: "Coordenador",
    dataNascimento: "01012005",
  },
  {
    nome: "Professor Teste",
    matricula: "22222",
    perfil: "Professor",
    dataNascimento: "01012005",
  },
  {
    nome: "Almoxarife Teste",
    matricula: "33333",
    perfil: "Almoxarife",
    dataNascimento: "01012005",
  },
];

export async function login(matricula: string, dataNascimento: string) {
  const usuarioEncontrado = usuariosLocais.find(
    (usuario) =>
      usuario.matricula === matricula &&
      usuario.dataNascimento === dataNascimento
  );

  if (!usuarioEncontrado) {
    throw new Error("Matrícula ou data de nascimento inválida.");
  }

  const usuarioLogado: UsuarioLogado = {
    nome: usuarioEncontrado.nome,
    matricula: usuarioEncontrado.matricula,
    perfil: usuarioEncontrado.perfil as Perfil,
  };

  localStorage.setItem(TOKEN_KEY, "token-local-temporario");
  localStorage.setItem(USUARIO_KEY, JSON.stringify(usuarioLogado));

  return usuarioLogado;
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