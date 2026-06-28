export type Perfil = "Admin" | "Coordenador" | "Professor" | "Almoxarife";

export interface UsuarioLogado {
  nome: string;
  matricula: string;
  perfil: Perfil;
}