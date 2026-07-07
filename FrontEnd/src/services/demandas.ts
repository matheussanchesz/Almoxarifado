import { api } from "./api";

export type StatusDemanda =
  | "Aberta"
  | "Em Analise"
  | "Em Análise"
  | "Em Andamento"
  | "Aguardando Material"
  | "Concluida"
  | "Concluída"
  | "Cancelada";

export type Prioridade = "Baixa" | "Normal" | "Alta" | "Urgente";

export interface DemandaApi {
  id: string;
  titulo: string;
  descricao: string;
  oficina: string;
  prioridade: Prioridade;
  status: StatusDemanda;
  professorNome: string;
  professorMatricula: string;
  dataHoraNecessaria: string;
  dataHoraCriacao: string;
}

export interface CriarDemandaPayload {
  titulo: string;
  descricao: string;
  oficina: string;
  prioridade: Prioridade;
  dataHoraNecessaria: string;
}

export async function listarDemandasApi() {
  const response = await api.get<DemandaApi[]>("/Demandas");
  return response.data;
}

export async function obterDemandaApi(id: string) {
  const response = await api.get<DemandaApi>(`/Demandas/${id}`);
  return response.data;
}

export async function criarDemandaApi(payload: CriarDemandaPayload) {
  const response = await api.post<{ demanda: DemandaApi }>("/Demandas", payload);
  return response.data.demanda;
}

export async function alterarStatusDemandaApi(id: string, status: StatusDemanda) {
  const response = await api.put<{ demanda: DemandaApi }>(
    `/Demandas/${id}/status`,
    JSON.stringify(status),
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  return response.data.demanda;
}
