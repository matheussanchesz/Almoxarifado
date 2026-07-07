import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiAlertTriangle,
  FiBell,
  FiCheckCircle,
  FiClock,
  FiFilter,
  FiInfo,
  FiSearch,
} from "react-icons/fi";

import Header from "../../components/Header/Header";
import Sidebar from "../../components/Sidebar/Sidebar";
import {
  listarNotificacoesApi,
  marcarNotificacaoLidaApi,
  marcarTodasNotificacoesLidasApi,
  type NotificacaoApi,
} from "../../services/notificacoes";

import "./Notificacoes.css";

function formatarData(data: string) {
  return new Date(data).toLocaleString("pt-BR");
}

function prioridadeVisual(notificacao: NotificacaoApi) {
  if (notificacao.tipo.toLowerCase().includes("urgente")) return "Urgente";
  if (notificacao.cor === "red") return "Urgente";
  if (notificacao.cor === "yellow") return "Alta";
  return "Normal";
}

function Notificacoes() {
  const navigate = useNavigate();
  const [notificacoes, setNotificacoes] = useState<NotificacaoApi[]>([]);
  const [busca, setBusca] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");
  const [erro, setErro] = useState("");

  async function recarregarNotificacoes() {
    try {
      const dados = await listarNotificacoesApi();
      setNotificacoes(dados);
      setErro("");
    } catch {
      setErro("Nao foi possivel carregar as notificacoes da API.");
    }
  }

  useEffect(() => {
    let ativo = true;

    async function carregarInicial() {
      try {
        const dados = await listarNotificacoesApi();

        if (ativo) {
          setNotificacoes(dados);
          setErro("");
        }
      } catch {
        if (ativo) {
          setErro("Nao foi possivel carregar as notificacoes da API.");
        }
      }
    }

    void carregarInicial();

    return () => {
      ativo = false;
    };
  }, []);

  async function marcarComoLida(id: string) {
    await marcarNotificacaoLidaApi(id);
    await recarregarNotificacoes();
  }

  async function abrirOrigem(notificacao: NotificacaoApi) {
    await marcarNotificacaoLidaApi(notificacao.id);
    await recarregarNotificacoes();

    if (notificacao.link) {
      navigate(notificacao.link);
    } else if (notificacao.demandaId) {
      navigate(`/demandas/detalhes/${notificacao.demandaId}`);
    }
  }

  async function marcarTodas() {
    await marcarTodasNotificacoesLidasApi();
    await recarregarNotificacoes();
  }

  function limparFiltros() {
    setBusca("");
    setFiltroTipo("");
    setFiltroStatus("");
  }

  const notificacoesFiltradas = useMemo(() => {
    const termo = busca.toLowerCase();

    return notificacoes.filter((notificacao) => {
      const status = notificacao.lida ? "Lida" : "Nao lida";

      const correspondeBusca =
        notificacao.titulo.toLowerCase().includes(termo) ||
        notificacao.mensagem.toLowerCase().includes(termo) ||
        notificacao.id.toLowerCase().includes(termo);

      const correspondeTipo = !filtroTipo || notificacao.tipo === filtroTipo;
      const correspondeStatus = !filtroStatus || status === filtroStatus;

      return correspondeBusca && correspondeTipo && correspondeStatus;
    });
  }, [busca, filtroTipo, filtroStatus, notificacoes]);

  const total = notificacoes.length;
  const naoLidas = notificacoes.filter((notificacao) => !notificacao.lida).length;
  const urgentes = notificacoes.filter(
    (notificacao) => prioridadeVisual(notificacao) === "Urgente",
  ).length;
  const sistema = notificacoes.filter(
    (notificacao) => notificacao.tipo === "Sistema",
  ).length;

  return (
    <div className="notificacoes-layout">
      <Sidebar />

      <main className="notificacoes-main">
        <Header titulo="Notificações" />

        <section className="notificacoes-conteudo">
          <header className="notificacoes-cabecalho">
            <div>
              <p>Central de alertas reais da API.</p>
            </div>

            <button
              type="button"
              className="notificacoes-botao-marcar"
              onClick={() => void marcarTodas()}
              disabled={naoLidas === 0}
            >
              Marcar todas como lidas
            </button>
          </header>

          {erro && <p style={{ color: "#b91c1c", marginBottom: 12 }}>{erro}</p>}

          <section className="notificacoes-resumo">
            <article>
              <FiBell />
              <div>
                <strong>{total}</strong>
                <span>Total</span>
              </div>
            </article>

            <article className="nao-lidas">
              <FiClock />
              <div>
                <strong>{naoLidas}</strong>
                <span>Nao lidas</span>
              </div>
            </article>

            <article className="urgentes">
              <FiAlertTriangle />
              <div>
                <strong>{urgentes}</strong>
                <span>Urgentes</span>
              </div>
            </article>

            <article className="sistema">
              <FiInfo />
              <div>
                <strong>{sistema}</strong>
                <span>Sistema</span>
              </div>
            </article>
          </section>

          <section className="notificacoes-filtros">
            <div className="notificacoes-busca">
              <FiSearch />
              <input
                type="text"
                placeholder="Buscar notificacao..."
                value={busca}
                onChange={(evento) => setBusca(evento.target.value)}
              />
            </div>

            <select
              value={filtroTipo}
              onChange={(evento) => setFiltroTipo(evento.target.value)}
            >
              <option value="">Todos os tipos</option>
              {[...new Set(notificacoes.map((n) => n.tipo))].map((tipo) => (
                <option key={tipo} value={tipo}>
                  {tipo}
                </option>
              ))}
            </select>

            <select
              value={filtroStatus}
              onChange={(evento) => setFiltroStatus(evento.target.value)}
            >
              <option value="">Todos os status</option>
              <option value="Nao lida">Nao lida</option>
              <option value="Lida">Lida</option>
            </select>

            <button type="button" onClick={limparFiltros}>
              <FiFilter />
              Limpar
            </button>
          </section>

          <section className="notificacoes-lista">
            {notificacoesFiltradas.map((notificacao) => {
              const prioridade = prioridadeVisual(notificacao);
              const status = notificacao.lida ? "Lida" : "Nao lida";

              return (
                <article
                  key={notificacao.id}
                  className={`notificacao-card ${!notificacao.lida ? "nao-lida" : ""}`}
                >
                  <div className={`notificacao-icone ${prioridade.toLowerCase()}`}>
                    {prioridade === "Urgente" ? (
                      <FiAlertTriangle />
                    ) : notificacao.lida ? (
                      <FiCheckCircle />
                    ) : (
                      <FiBell />
                    )}
                  </div>

                  <div className="notificacao-corpo">
                    <div className="notificacao-topo">
                      <div>
                        <span>{notificacao.id}</span>
                        <h2>{notificacao.titulo}</h2>
                      </div>

                      <strong>{formatarData(notificacao.dataCriacao)}</strong>
                    </div>

                    <p>{notificacao.mensagem}</p>

                    <footer>
                      <span className="notificacao-tipo">{notificacao.tipo}</span>

                      <span
                        className={`notificacao-prioridade ${prioridade.toLowerCase()}`}
                      >
                        {prioridade}
                      </span>

                      <span className="notificacao-status">{status}</span>

                      {!notificacao.lida && (
                        <button
                          type="button"
                          onClick={() => void marcarComoLida(notificacao.id)}
                        >
                          Marcar como lida
                        </button>
                      )}

                      {(notificacao.link || notificacao.demandaId) && (
                        <button
                          type="button"
                          onClick={() => void abrirOrigem(notificacao)}
                        >
                          Abrir origem
                        </button>
                      )}
                    </footer>
                  </div>
                </article>
              );
            })}

            {notificacoesFiltradas.length === 0 && (
              <div className="notificacoes-vazio">
                Nenhuma notificacao encontrada.
              </div>
            )}
          </section>
        </section>
      </main>
    </div>
  );
}

export default Notificacoes;
