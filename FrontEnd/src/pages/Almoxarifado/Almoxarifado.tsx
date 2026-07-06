import { useMemo, useState } from "react";
import {
  FiChevronDown,
  FiFilter,
  FiMoreVertical,
  FiX,
  FiClock,
  FiUser,
  FiMapPin,
  FiFileText,
  FiPlayCircle,
  FiPackage,
  FiCheckCircle,
  FiSlash,
} from "react-icons/fi";

import Sidebar from "../../components/Sidebar/Sidebar";
import {
  alterarStatusDemandaLocal,
  listarDemandasLocais,
  type DemandaLocal,
  type StatusDemanda,
} from "../../services/localData";

import "./Almoxarifado.css";

const colunas: Array<{
  titulo: string;
  status: StatusDemanda;
}> = [
  { titulo: "Abertas", status: "Aberta" },
  { titulo: "Em Andamento", status: "Em Andamento" },
  { titulo: "Aguardando Material", status: "Aguardando Material" },
  { titulo: "Concluídas", status: "Concluída" },
];

function formatarData(data: string) {
  return new Date(data).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function classePrioridade(prioridade: string) {
  return prioridade
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function textoPrazo(status: StatusDemanda) {
  return status === "Concluída" ? "Concluída em:" : "Prazo:";
}

function proximoStatus(status: StatusDemanda): StatusDemanda {
  if (status === "Aberta") return "Em Andamento";
  if (status === "Em Andamento") return "Aguardando Material";
  if (status === "Aguardando Material") return "Concluída";
  return "Aberta";
}

function Almoxarifado() {
  const [demandas, setDemandas] = useState<DemandaLocal[]>(() =>
    listarDemandasLocais()
  );

  const [demandaAberta, setDemandaAberta] = useState<DemandaLocal | null>(null);

  const [colunasExpandidas, setColunasExpandidas] = useState<
    Record<string, boolean>
  >({});

  const demandasOrdenadas = useMemo(() => {
    const pesoPrioridade = {
      Urgente: 1,
      Alta: 2,
      Normal: 3,
      Baixa: 4,
    };

    return [...demandas].sort((a, b) => {
      const prioridadeA = pesoPrioridade[a.prioridade];
      const prioridadeB = pesoPrioridade[b.prioridade];

      if (prioridadeA !== prioridadeB) {
        return prioridadeA - prioridadeB;
      }

      return (
        new Date(a.dataHoraNecessaria).getTime() -
        new Date(b.dataHoraNecessaria).getTime()
      );
    });
  }, [demandas]);


function alterarStatus(id: string, novoStatus: StatusDemanda) {
  alterarStatusDemandaLocal(id, novoStatus);

  setDemandas(listarDemandasLocais());

  setTimeout(() => {
    setDemandaAberta(null);
  }, 300);
}

  function avancarStatus(demanda: DemandaLocal) {
    alterarStatus(demanda.id, proximoStatus(demanda.status));
  }

  function alternarVerMais(status: StatusDemanda) {
    setColunasExpandidas((estadoAtual) => ({
      ...estadoAtual,
      [status]: !estadoAtual[status],
    }));
  }

  return (
    <div className="almoxarifado-layout">
      <Sidebar />

      <main className="almoxarifado-main">
        <section className="almoxarifado-conteudo">
          <header className="almoxarifado-cabecalho">
            <div>
              <h1>Fila de Demandas</h1>
              <p>Gerencie e priorize as demandas do almoxarifado.</p>
            </div>

            <div className="almoxarifado-filtros-topo">
              <label>
                Ordenar por:
                <button type="button" className="almoxarifado-select">
                  Prazo mais próximo
                  <FiChevronDown />
                </button>
              </label>

              <button type="button" className="almoxarifado-filtrar">
                <FiFilter />
                Filtrar
              </button>
            </div>
          </header>

          <div className="almoxarifado-kanban">
            {colunas.map((coluna) => {
              const demandasDaColuna = demandasOrdenadas.filter(
                (demanda) => demanda.status === coluna.status
              );

              const estaExpandida = colunasExpandidas[coluna.status];

              const demandasVisiveis = estaExpandida
                ? demandasDaColuna
                : demandasDaColuna.slice(0, 3);

              return (
                <section className="almoxarifado-coluna" key={coluna.status}>
                  <header className="almoxarifado-coluna-topo">
                    <h2>
                      {coluna.titulo} ({demandasDaColuna.length})
                    </h2>
                  </header>

                  <div className="almoxarifado-cards">
                    {demandasVisiveis.map((demanda) => (
                      <article
                        className="almoxarifado-card"
                        key={demanda.id}
                        onClick={() => setDemandaAberta(demanda)}
                      >
                        <div className="almoxarifado-card-topo">
                          <div>
                            <strong>#{demanda.id.slice(0, 4)}</strong>
                            <h3>{demanda.oficina}</h3>
                          </div>

                          <button
                            type="button"
                            className="almoxarifado-menu-card"
                            onClick={(evento) => {
                              evento.stopPropagation();
                              avancarStatus(demanda);
                            }}
                            title="Avançar status"
                          >
                            <FiMoreVertical />
                          </button>
                        </div>

                        <span
                          className={`almoxarifado-prioridade ${classePrioridade(
                            demanda.prioridade
                          )}`}
                        >
                          {demanda.prioridade}
                        </span>

                        <p className="almoxarifado-prazo">
                          {textoPrazo(demanda.status)}{" "}
                          {formatarData(demanda.dataHoraNecessaria)}
                        </p>

                        <p className="almoxarifado-professor">
                          {demanda.professorNome}
                        </p>
                      </article>
                    ))}

                    {demandasDaColuna.length === 0 && (
                      <div className="almoxarifado-vazio">
                        Nenhuma demanda neste status.
                      </div>
                    )}
                  </div>

                  {demandasDaColuna.length > 3 && (
                    <button
                      type="button"
                      className="almoxarifado-ver-mais"
                      onClick={() => alternarVerMais(coluna.status)}
                    >
                      {estaExpandida ? "− Ver menos" : "+ Ver mais"}
                    </button>
                  )}
                </section>
              );
            })}
          </div>
        </section>
      </main>

      {demandaAberta && (
        <div
          className="almoxarifado-modal-fundo"
          onClick={() => setDemandaAberta(null)}
        >
          <aside
            className="almoxarifado-modal"
            onClick={(evento) => evento.stopPropagation()}
          >
            <header className="almoxarifado-modal-topo">
              <div>
                <span
                  className={`almoxarifado-prioridade ${classePrioridade(
                    demandaAberta.prioridade
                  )}`}
                >
                  {demandaAberta.prioridade}
                </span>

                <h2>
                  #{demandaAberta.id.slice(0, 4)} - {demandaAberta.oficina}
                </h2>

                <p>{demandaAberta.titulo}</p>
              </div>

              <button
                type="button"
                className="almoxarifado-fechar"
                onClick={() => setDemandaAberta(null)}
              >
                <FiX />
              </button>
            </header>

            <section className="almoxarifado-modal-status">
              <span>Status atual</span>
              <strong>{demandaAberta.status}</strong>
            </section>

            <section className="almoxarifado-modal-grid">
              <div className="almoxarifado-info-card">
                <FiUser />
                <div>
                  <span>Professor</span>
                  <strong>{demandaAberta.professorNome}</strong>
                </div>
              </div>

              <div className="almoxarifado-info-card">
                <FiClock />
                <div>
                  <span>Prazo operacional</span>
                  <strong>{formatarData(demandaAberta.dataHoraNecessaria)}</strong>
                </div>
              </div>

              <div className="almoxarifado-info-card">
                <FiMapPin />
                <div>
                  <span>Oficina</span>
                  <strong>{demandaAberta.oficina}</strong>
                </div>
              </div>

              <div className="almoxarifado-info-card">
                <FiFileText />
                <div>
                  <span>Criada em</span>
                  <strong>{formatarData(demandaAberta.dataHoraCriacao)}</strong>
                </div>
              </div>
            </section>

            <section className="almoxarifado-modal-secao">
              <h3>Descrição da solicitação</h3>
              <p>{demandaAberta.descricao}</p>
            </section>

            <section className="almoxarifado-modal-secao">
              <h3>Alterar status</h3>

              <div className="almoxarifado-acoes">
                <button
                  type="button"
                  className="acao aberta"
                  onClick={() => alterarStatus(demandaAberta.id, "Aberta")}
                >
                  <FiFileText />
                  Aberta
                </button>

                <button
                  type="button"
                  className="acao andamento"
                  onClick={() =>
                    alterarStatus(demandaAberta.id, "Em Andamento")
                  }
                >
                  <FiPlayCircle />
                  Em andamento
                </button>

                <button
                  type="button"
                  className="acao material"
                  onClick={() =>
                    alterarStatus(demandaAberta.id, "Aguardando Material")
                  }
                >
                  <FiPackage />
                  Aguardando material
                </button>

                <button
                  type="button"
                  className="acao concluida"
                  onClick={() => alterarStatus(demandaAberta.id, "Concluída")}
                >
                  <FiCheckCircle />
                  Concluída
                </button>

                <button
                  type="button"
                  className="acao cancelada"
                  onClick={() => alterarStatus(demandaAberta.id, "Cancelada")}
                >
                  <FiSlash />
                  Cancelar demanda
                </button>
              </div>
            </section>
          </aside>
        </div>
      )}
    </div>
  );
}

export default Almoxarifado;