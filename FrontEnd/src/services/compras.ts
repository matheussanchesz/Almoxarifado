import { api } from "./api";

export type SolicitacaoCompra = {
  id: string;
  categoria: string;
  nomeItem: string;
  especificacao: string;
  quantidade: number;
  urgencia: string;
  justificativa: string;
  almoxarifeMatricula: string;
  almoxarifeNome: string;
  dataSolicitacao: string;
  status: string;
};

export type CriarSolicitacaoCompraPayload = {
  categoria: string;
  nomeItem: string;
  especificacao: string;
  quantidade: number;
  urgencia: string;
  justificativa: string;
};

export async function listarComprasApi(status?: string) {
  const response = await api.get<SolicitacaoCompra[]>("/SolicitacoesCompra", {
    params: status ? { status } : undefined,
  });
  return response.data;
}

export async function obterCompraApi(id: string) {
  const response = await api.get<SolicitacaoCompra>(`/SolicitacoesCompra/${id}`);
  return response.data;
}

export async function criarCompraApi(payload: CriarSolicitacaoCompraPayload) {
  const response = await api.post<{ solicitacao: SolicitacaoCompra }>(
    "/SolicitacoesCompra",
    payload,
  );
  return response.data.solicitacao;
}

export async function atualizarStatusCompraApi(id: string, status: string) {
  const response = await api.put<{ solicitacao: SolicitacaoCompra }>(
    `/SolicitacoesCompra/${id}/status`,
    { status },
  );
  return response.data.solicitacao;
}
