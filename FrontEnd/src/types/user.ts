export type Perfil =
  | "Admin"
  | "Coordenador"
  | "Professor"
  | "Almoxarife"
  | "Almoxarifado";

export interface UsuarioLogado {
  nome: string;
  matricula: string;
  perfil: Perfil;
  email?: string;
  telefone?: string;
  setor?: string;
  primeiroAcesso?: boolean;
}
