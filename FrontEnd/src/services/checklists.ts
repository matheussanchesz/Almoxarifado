import { api } from "./api";

export type ChecklistItemApi = {
  id: string;
  descricao: string;
  categoria: string;
};

export type ChecklistApi = {
  id: string;
  nome: string;
  descricao: string;
  oficina: string;
  itens: ChecklistItemApi[];
  dataCriacao: string;
  ativo: boolean;
};

export type ExecucaoChecklistApi = {
  id: string;
  checklistId: string;
  demandaId: string;
  almoxarifeMatricula: string;
  almoxarifeNome: string;
  itens: Array<{
    itemId: string;
    descricao: string;
    status: string;
    observacao: string;
    fotoUrl: string;
  }>;
  dataExecucao: string;
  status: string;
};

export async function listarChecklistsApi(apenasAtivos = false) {
  const response = await api.get<ChecklistApi[]>("/Checklists", {
    params: { apenasAtivos },
  });
  return response.data;
}

export async function obterChecklistApi(id: string) {
  const response = await api.get<ChecklistApi>(`/Checklists/${id}`);
  return response.data;
}

export async function criarChecklistApi(payload: {
  nome: string;
  descricao: string;
  oficina: string;
  itens: Array<{ descricao: string; categoria: string }>;
}) {
  const response = await api.post<{ checklist: ChecklistApi }>("/Checklists", payload);
  return response.data.checklist;
}

export async function editarChecklistApi(
  id: string,
  payload: {
    nome: string;
    descricao: string;
    oficina: string;
    ativo: boolean;
    itens: ChecklistItemApi[];
  },
) {
  const response = await api.put<{ checklist: ChecklistApi }>(
    `/Checklists/${id}`,
    payload,
  );
  return response.data.checklist;
}

export async function duplicarChecklistApi(id: string) {
  const response = await api.post<{ checklist: ChecklistApi }>(
    `/Checklists/${id}/duplicar`,
  );
  return response.data.checklist;
}

export async function excluirChecklistApi(id: string) {
  await api.delete(`/Checklists/${id}`);
}

export async function executarChecklistApi(payload: {
  checklistId: string;
  demandaId?: string;
  itens: Array<{
    itemId: string;
    status: string;
    observacao: string;
    fotoUrl?: string;
  }>;
}) {
  const response = await api.post<{ execucao: ExecucaoChecklistApi }>(
    "/Checklists/executar",
    {
      demandaId: "",
      ...payload,
    },
  );
  return response.data.execucao;
}

export async function listarExecucoesChecklistApi(demandaId?: string) {
  const response = await api.get<ExecucaoChecklistApi[]>("/Checklists/execucoes", {
    params: demandaId ? { demandaId } : undefined,
  });
  return response.data;
}
