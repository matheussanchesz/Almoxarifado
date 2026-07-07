import { api } from "./api";

export type NotificacaoApi = {
  id: string;
  titulo: string;
  mensagem: string;
  tipo: string;
  icone: string;
  cor: string;
  link?: string | null;
  demandaId?: string | null;
  lida: boolean;
  dataCriacao: string;
  dataLeitura?: string | null;
};

export async function listarNotificacoesApi() {
  const response = await api.get<NotificacaoApi[]>("/Notificacoes");
  return response.data;
}

export async function marcarNotificacaoLidaApi(id: string, lida = true) {
  await api.put(`/Notificacoes/${id}/marcar-lida`, { lida });
}

export async function marcarTodasNotificacoesLidasApi() {
  await api.put("/Notificacoes/marcar-todas-lidas");
}
