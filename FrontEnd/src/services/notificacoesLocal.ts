export type TipoNotificacao = "Demanda" | "Compra" | "Checklist" | "Sistema";
export type StatusNotificacao = "Não lida" | "Lida";
export type PrioridadeNotificacao = "Normal" | "Alta" | "Urgente";

export type NotificacaoLocal = {
  id: string;
  titulo: string;
  mensagem: string;
  tipo: TipoNotificacao;
  status: StatusNotificacao;
  prioridade: PrioridadeNotificacao;
  data: string;
  rotaOrigem?: string;
};

const CHAVE_NOTIFICACOES = "@senai:notificacoes";

const notificacoesIniciais: NotificacaoLocal[] = [
  {
    id: "NOT-001",
    titulo: "Nova demanda urgente",
    mensagem: "Foi aberta uma demanda urgente para o almoxarifado.",
    tipo: "Demanda",
    status: "Não lida",
    prioridade: "Urgente",
    data: new Date().toISOString(),
    rotaOrigem: "/demandas",
  },
  {
    id: "NOT-002",
    titulo: "Compra registrada",
    mensagem: "Uma nova solicitação de compra foi cadastrada.",
    tipo: "Compra",
    status: "Não lida",
    prioridade: "Alta",
    data: new Date().toISOString(),
    rotaOrigem: "/compras",
  },
];

export function listarNotificacoes(): NotificacaoLocal[] {
  const dados = localStorage.getItem(CHAVE_NOTIFICACOES);

  if (dados) {
    return JSON.parse(dados);
  }

  localStorage.setItem(CHAVE_NOTIFICACOES, JSON.stringify(notificacoesIniciais));
  return notificacoesIniciais;
}

export function salvarNotificacoes(notificacoes: NotificacaoLocal[]) {
  localStorage.setItem(CHAVE_NOTIFICACOES, JSON.stringify(notificacoes));
}

export function marcarNotificacaoComoLida(id: string) {
  const notificacoes = listarNotificacoes();

  const atualizadas = notificacoes.map((notificacao) =>
    notificacao.id === id
      ? { ...notificacao, status: "Lida" as const }
      : notificacao,
  );

  salvarNotificacoes(atualizadas);
}

export function marcarTodasComoLidas() {
  const notificacoes = listarNotificacoes();

  const atualizadas = notificacoes.map((notificacao) => ({
    ...notificacao,
    status: "Lida" as const,
  }));

  salvarNotificacoes(atualizadas);
}

export function contarNaoLidas() {
  return listarNotificacoes().filter(
    (notificacao) => notificacao.status === "Não lida",
  ).length;
}