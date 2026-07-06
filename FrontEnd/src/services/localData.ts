export type StatusDemanda =
  | "Aberta"
  | "Em Análise"
  | "Em Andamento"
  | "Aguardando Material"
  | "Concluída"
  | "Cancelada";

export type Prioridade = "Baixa" | "Normal" | "Alta" | "Urgente";

export interface DemandaLocal {
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

const CHAVE_DEMANDAS = "@senai:demandas";

function carregarDemandas(): DemandaLocal[] {
  const dados = localStorage.getItem(CHAVE_DEMANDAS);

  if (dados) {
    return JSON.parse(dados);
  }

  const demandasIniciais: DemandaLocal[] = [
    {
      id: "1",
      titulo: "Preparar oficina de motores",
      descricao: "Separar ferramentas e organizar bancada para aula prática.",
      oficina: "Motores Ciclo Otto",
      prioridade: "Alta",
      status: "Aberta",
      professorNome: "Professor Teste",
      professorMatricula: "12345",
      dataHoraNecessaria: "2026-06-29T08:00",
      dataHoraCriacao: new Date().toISOString(),
    },
    {
      id: "2",
      titulo: "Verificar veículo didático",
      descricao: "Disponibilizar carro para atividade de diagnóstico.",
      oficina: "Diagnóstico Automotivo",
      prioridade: "Urgente",
      status: "Em Andamento",
      professorNome: "Professor Teste",
      professorMatricula: "12345",
      dataHoraNecessaria: "2026-06-29T10:00",
      dataHoraCriacao: new Date().toISOString(),
    },
  ];

  localStorage.setItem(CHAVE_DEMANDAS, JSON.stringify(demandasIniciais));
  return demandasIniciais;
}

function salvarDemandas(demandas: DemandaLocal[]) {
  localStorage.setItem(CHAVE_DEMANDAS, JSON.stringify(demandas));
}

export function listarDemandasLocais() {
  return carregarDemandas();
}

export function criarDemandaLocal(
  demanda: Omit<DemandaLocal, "id" | "dataHoraCriacao" | "status">
) {
  const demandas = carregarDemandas();

  const novaDemanda: DemandaLocal = {
    ...demanda,
    id: crypto.randomUUID(),
    status: "Aberta",
    dataHoraCriacao: new Date().toISOString(),
  };

  demandas.push(novaDemanda);
  salvarDemandas(demandas);

  return novaDemanda;
}

export function alterarStatusDemandaLocal(id: string, status: StatusDemanda) {
  const demandas = carregarDemandas();

  const atualizadas = demandas.map((demanda) =>
    demanda.id === id ? { ...demanda, status } : demanda
  );

  salvarDemandas(atualizadas);
  return atualizadas.find((demanda) => demanda.id === id);
}

export function obterDashboardLocal() {
  const demandas = carregarDemandas();

  return {
    totalDemandas: demandas.length,
    abertas: demandas.filter((d) => d.status === "Aberta").length,
    emAndamento: demandas.filter((d) => d.status === "Em Andamento").length,
    concluidas: demandas.filter((d) => d.status === "Concluída").length,
    urgentes: demandas.filter((d) => d.prioridade === "Urgente").length,
    demandas,
  };
}