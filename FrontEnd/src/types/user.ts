export type Perfil =
  | "Desenvolvedor"
  | "Admin"
  | "Coordenador"
  | "Professor"
  | "Almoxarife"
  | "Almoxarifado";

export interface UsuarioLogado {
  nome: string;
  matricula: string;
  perfil: Perfil;
}
