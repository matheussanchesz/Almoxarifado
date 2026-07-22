import type { Perfil } from "../types/user";

export type Recurso =
  | "dashboard"
  | "demandas"
  | "novaDemanda"
  | "almoxarifado"
  | "compras"
  | "novaCompra"
  | "checklists"
  | "novoChecklist"
  | "relatorios"
  | "usuarios"
  | "notificacoes";

const permissoes: Record<Perfil, Recurso[]> = {
  Desenvolvedor: [
    "dashboard",
    "demandas",
    "novaDemanda",
    "almoxarifado",
    "compras",
    "novaCompra",
    "checklists",
    "novoChecklist",
    "relatorios",
    "usuarios",
    "notificacoes",
  ],
  Admin: [
    "dashboard",
    "demandas",
    "almoxarifado",
    "compras",
    "novaCompra",
    "checklists",
    "novoChecklist",
    "relatorios",
    "usuarios",
    "notificacoes",
  ],
  Coordenador: [
    "dashboard",
    "demandas",
    "almoxarifado",
    "compras",
    "relatorios",
    "usuarios",
    "notificacoes",
  ],
  Professor: ["dashboard", "demandas", "novaDemanda", "notificacoes"],
  Almoxarife: [
    "dashboard",
    "demandas",
    "almoxarifado",
    "compras",
    "novaCompra",
    "checklists",
    "novoChecklist",
    "notificacoes",
  ],
  Almoxarifado: [
    "dashboard",
    "demandas",
    "almoxarifado",
    "compras",
    "novaCompra",
    "checklists",
    "novoChecklist",
    "notificacoes",
  ],
};

export function temPermissao(perfil: Perfil | undefined, recurso: Recurso) {
  return perfil ? permissoes[perfil].includes(recurso) : false;
}

export function perfisPermitidos(recurso: Recurso): Perfil[] {
  return (Object.keys(permissoes) as Perfil[]).filter((perfil) =>
    permissoes[perfil].includes(recurso),
  );
}
