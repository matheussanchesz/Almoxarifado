export type StatusItemChecklist =
  | "Pendente"
  | "Conforme"
  | "Faltante"
  | "Danificado";

export interface ModeloChecklist {
  id: string;
  nome: string;
  oficina: string;
  categoria: string;
  descricao: string;
  itens: string[];
  ativo: boolean;
  dataCriacao: string;
}

const CHAVE_MODELOS = "@senai:modelos-checklist";

const modelosIniciais: ModeloChecklist[] = [
  {
    id: "modelo-otto",
    nome: "Checklist - Motores Ciclo Otto",
    oficina: "Motores Ciclo Otto",
    categoria: "Ferramentas",
    descricao:
      "Checklist de ferramentas para conferência da oficina Motores Ciclo Otto.",
    itens: [
      "Conferir ferramentas básicas da bancada",
      "Verificar torquímetros e soquetes",
      "Conferir disponibilidade de EPIs",
      "Verificar organização da bancada",
      "Registrar ferramentas faltantes ou danificadas",
    ],
    ativo: true,
    dataCriacao: new Date().toISOString(),
  },
  {
    id: "modelo-diesel",
    nome: "Checklist - Motores Ciclo Diesel",
    oficina: "Motores Ciclo Diesel",
    categoria: "Ferramentas",
    descricao:
      "Checklist de ferramentas para conferência da oficina Motores Ciclo Diesel.",
    itens: [
      "Conferir ferramentas específicas de motores Diesel",
      "Verificar bancada de desmontagem",
      "Conferir instrumentos de medição",
      "Verificar limpeza da área",
      "Registrar avarias encontradas",
    ],
    ativo: true,
    dataCriacao: new Date().toISOString(),
  },
  {
    id: "modelo-eletrica",
    nome: "Checklist - Elétrica e Eletrônica Automotiva",
    oficina: "Elétrica e Eletrônica Automotiva",
    categoria: "Equipamentos",
    descricao:
      "Checklist de equipamentos para conferência da oficina Elétrica e Eletrônica Automotiva.",
    itens: [
      "Conferir multímetros",
      "Verificar cabos e conectores",
      "Conferir fontes de alimentação",
      "Organizar bancadas de diagnóstico",
      "Registrar itens danificados",
    ],
    ativo: true,
    dataCriacao: new Date().toISOString(),
  },
  {
    id: "modelo-chassi",
    nome: "Checklist - Chassi e Suspensão",
    oficina: "Chassi e Suspensão",
    categoria: "Segurança",
    descricao:
      "Checklist de segurança para conferência da oficina Chassi e Suspensão.",
    itens: [
      "Conferir elevador automotivo",
      "Verificar cavaletes e bandejas",
      "Conferir ferramentas de suspensão",
      "Verificar área de circulação",
      "Registrar irregularidades de segurança",
    ],
    ativo: true,
    dataCriacao: new Date().toISOString(),
  },
];

export function listarModelosChecklist(): ModeloChecklist[] {
  const dados = localStorage.getItem(CHAVE_MODELOS);

  if (dados) {
    return JSON.parse(dados);
  }

  localStorage.setItem(CHAVE_MODELOS, JSON.stringify(modelosIniciais));
  return modelosIniciais;
}

export function salvarModelosChecklist(modelos: ModeloChecklist[]) {
  localStorage.setItem(CHAVE_MODELOS, JSON.stringify(modelos));
}

export function criarModeloChecklist(dados: {
  nome: string;
  oficina: string;
  categoria: string;
  itens: string[];
}) {
  const modelos = listarModelosChecklist();

  const novoModelo: ModeloChecklist = {
    id: crypto.randomUUID(),
    nome: dados.nome,
    oficina: dados.oficina,
    categoria: dados.categoria,
    descricao: `Checklist de ${dados.categoria.toLowerCase()} para conferência da oficina ${dados.oficina}.`,
    itens: dados.itens,
    ativo: true,
    dataCriacao: new Date().toISOString(),
  };

  modelos.push(novoModelo);
  salvarModelosChecklist(modelos);

  return novoModelo;
}

export function duplicarModeloChecklist(id: string) {
  const modelos = listarModelosChecklist();
  const modelo = modelos.find((item) => item.id === id);

  if (!modelo) return;

  const duplicado: ModeloChecklist = {
    ...modelo,
    id: crypto.randomUUID(),
    nome: `${modelo.nome} - Cópia`,
    dataCriacao: new Date().toISOString(),
  };

  modelos.push(duplicado);
  salvarModelosChecklist(modelos);
}

export function alternarStatusModeloChecklist(id: string) {
  const modelos = listarModelosChecklist();

  const atualizados = modelos.map((modelo) =>
    modelo.id === id ? { ...modelo, ativo: !modelo.ativo } : modelo
  );

  salvarModelosChecklist(atualizados);
}

export function excluirModeloChecklist(id: string) {
  const modelos = listarModelosChecklist().filter((modelo) => modelo.id !== id);
  salvarModelosChecklist(modelos);
}

export function editarModeloChecklist(
  id: string,
  dados: {
    nome: string;
    oficina: string;
    categoria: string;
    itens: string[];
  }
) {
  const modelos = listarModelosChecklist();

  const atualizados = modelos.map((modelo) =>
    modelo.id === id
      ? {
          ...modelo,
          nome: dados.nome,
          oficina: dados.oficina,
          categoria: dados.categoria,
          descricao: `Checklist de ${dados.categoria.toLowerCase()} para conferência da oficina ${dados.oficina}.`,
          itens: dados.itens,
        }
      : modelo
  );

  salvarModelosChecklist(atualizados);
}

export interface ItemExecucaoChecklist {
  id: string;
  descricao: string;
  status: StatusItemChecklist;
  observacao: string;
  foto?: string;
}

export interface ExecucaoChecklistSalva {
  id: string;
  modeloId: string;
  nomeModelo: string;
  oficina: string;
  categoria: string;
  almoxarifeNome: string;
  dataExecucao: string;
  itens: ItemExecucaoChecklist[];
}

const CHAVE_EXECUCOES = "@senai:execucoes-checklist";

export function salvarExecucaoChecklist(
  execucao: Omit<ExecucaoChecklistSalva, "id" | "dataExecucao">
) {
  const dados = localStorage.getItem(CHAVE_EXECUCOES);
  const execucoes: ExecucaoChecklistSalva[] = dados ? JSON.parse(dados) : [];

  const novaExecucao: ExecucaoChecklistSalva = {
    ...execucao,
    id: crypto.randomUUID(),
    dataExecucao: new Date().toISOString(),
  };

  execucoes.push(novaExecucao);
  localStorage.setItem(CHAVE_EXECUCOES, JSON.stringify(execucoes));

  return novaExecucao;
}

export function listarExecucoesChecklist(): ExecucaoChecklistSalva[] {
  const dados = localStorage.getItem(CHAVE_EXECUCOES);
  return dados ? JSON.parse(dados) : [];
}


export interface RascunhoChecklist {
  id: string;
  modeloId: string;
  nomeModelo: string;
  oficina: string;
  categoria: string;
  almoxarifeNome: string;
  dataAtualizacao: string;
  itens: ItemExecucaoChecklist[];
}

const CHAVE_RASCUNHOS = "@senai:rascunhos-checklist";

export function salvarRascunhoChecklist(
  rascunho: Omit<RascunhoChecklist, "id" | "dataAtualizacao">
) {
  const dados = localStorage.getItem(CHAVE_RASCUNHOS);
  const rascunhos: RascunhoChecklist[] = dados ? JSON.parse(dados) : [];

  const existente = rascunhos.find(
    (item) => item.modeloId === rascunho.modeloId
  );

  const atualizados = existente
    ? rascunhos.map((item) =>
        item.modeloId === rascunho.modeloId
          ? {
              ...item,
              ...rascunho,
              dataAtualizacao: new Date().toISOString(),
            }
          : item
      )
    : [
        ...rascunhos,
        {
          ...rascunho,
          id: crypto.randomUUID(),
          dataAtualizacao: new Date().toISOString(),
        },
      ];

  localStorage.setItem(CHAVE_RASCUNHOS, JSON.stringify(atualizados));
}

export function obterRascunhoChecklist(modeloId: string) {
  const dados = localStorage.getItem(CHAVE_RASCUNHOS);
  const rascunhos: RascunhoChecklist[] = dados ? JSON.parse(dados) : [];

  return rascunhos.find((item) => item.modeloId === modeloId) || null;
}

export function removerRascunhoChecklist(modeloId: string) {
  const dados = localStorage.getItem(CHAVE_RASCUNHOS);
  const rascunhos: RascunhoChecklist[] = dados ? JSON.parse(dados) : [];

  const atualizados = rascunhos.filter((item) => item.modeloId !== modeloId);

  localStorage.setItem(CHAVE_RASCUNHOS, JSON.stringify(atualizados));
}