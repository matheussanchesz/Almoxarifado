import { useMemo, useState } from "react";
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
    listarNotificacoes,
    marcarNotificacaoComoLida,
    marcarTodasComoLidas,
    type NotificacaoLocal,
} from "../../services/notificacoesLocal";

import "./Notificacoes.css";

function formatarData(data: string) {
    return new Date(data).toLocaleString("pt-BR");
}

function Notificacoes() {
    const navigate = useNavigate();
    const [notificacoes, setNotificacoes] = useState<NotificacaoLocal[]>(() =>
        listarNotificacoes(),
    );

    const [busca, setBusca] = useState("");
    const [filtroTipo, setFiltroTipo] = useState("");
    const [filtroStatus, setFiltroStatus] = useState("");

    function recarregarNotificacoes() {
        setNotificacoes(listarNotificacoes());
    }

    function marcarComoLida(id: string) {
        marcarNotificacaoComoLida(id);
        recarregarNotificacoes();
    }

    function abrirOrigem(notificacao: NotificacaoLocal) {
        marcarNotificacaoComoLida(notificacao.id);
        recarregarNotificacoes();

        if (notificacao.rotaOrigem) {
            navigate(notificacao.rotaOrigem);
        }
    }

    function marcarTodas() {
        marcarTodasComoLidas();
        recarregarNotificacoes();
    }

    function limparFiltros() {
        setBusca("");
        setFiltroTipo("");
        setFiltroStatus("");
    }

    const notificacoesFiltradas = useMemo(() => {
        const termo = busca.toLowerCase();

        return notificacoes.filter((notificacao) => {
            const correspondeBusca =
                notificacao.titulo.toLowerCase().includes(termo) ||
                notificacao.mensagem.toLowerCase().includes(termo) ||
                notificacao.id.toLowerCase().includes(termo);

            const correspondeTipo = !filtroTipo || notificacao.tipo === filtroTipo;

            const correspondeStatus =
                !filtroStatus || notificacao.status === filtroStatus;

            return correspondeBusca && correspondeTipo && correspondeStatus;
        });
    }, [busca, filtroTipo, filtroStatus, notificacoes]);

    const total = notificacoes.length;

    const naoLidas = notificacoes.filter(
        (notificacao) => notificacao.status === "Não lida",
    ).length;

    const urgentes = notificacoes.filter(
        (notificacao) => notificacao.prioridade === "Urgente",
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
                            <p>Central de alertas do sistema do almoxarifado.</p>
                        </div>

                        <button
                            type="button"
                            className="notificacoes-botao-marcar"
                            onClick={marcarTodas}
                            disabled={naoLidas === 0}
                        >
                            Marcar todas como lidas
                        </button>
                    </header>

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
                                <span>Não lidas</span>
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
                                placeholder="Buscar notificação..."
                                value={busca}
                                onChange={(evento) => setBusca(evento.target.value)}
                            />
                        </div>

                        <select
                            value={filtroTipo}
                            onChange={(evento) => setFiltroTipo(evento.target.value)}
                        >
                            <option value="">Todos os tipos</option>
                            <option value="Demanda">Demanda</option>
                            <option value="Compra">Compra</option>
                            <option value="Checklist">Checklist</option>
                            <option value="Sistema">Sistema</option>
                        </select>

                        <select
                            value={filtroStatus}
                            onChange={(evento) => setFiltroStatus(evento.target.value)}
                        >
                            <option value="">Todos os status</option>
                            <option value="Não lida">Não lida</option>
                            <option value="Lida">Lida</option>
                        </select>

                        <button type="button" onClick={limparFiltros}>
                            <FiFilter />
                            Limpar
                        </button>
                    </section>

                    <section className="notificacoes-lista">
                        {notificacoesFiltradas.map((notificacao) => (
                            <article
                                key={notificacao.id}
                                className={`notificacao-card ${notificacao.status === "Não lida" ? "nao-lida" : ""
                                    }`}
                            >
                                <div
                                    className={`notificacao-icone ${notificacao.prioridade.toLowerCase()}`}
                                >
                                    {notificacao.prioridade === "Urgente" ? (
                                        <FiAlertTriangle />
                                    ) : notificacao.status === "Lida" ? (
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

                                        <strong>{formatarData(notificacao.data)}</strong>
                                    </div>

                                    <p>{notificacao.mensagem}</p>

                                    <footer>
                                        <span className="notificacao-tipo">{notificacao.tipo}</span>

                                        <span
                                            className={`notificacao-prioridade ${notificacao.prioridade.toLowerCase()}`}
                                        >
                                            {notificacao.prioridade}
                                        </span>

                                        <span className="notificacao-status">{notificacao.status}</span>

                                        {notificacao.status === "Não lida" && (
                                            <button type="button" onClick={() => marcarComoLida(notificacao.id)}>
                                                Marcar como lida
                                            </button>
                                        )}

                                        {notificacao.rotaOrigem && (
                                            <button type="button" onClick={() => abrirOrigem(notificacao)}>
                                                Abrir origem
                                            </button>
                                        )}
                                    </footer>
                                </div>
                            </article>
                        ))}

                        {notificacoesFiltradas.length === 0 && (
                            <div className="notificacoes-vazio">
                                Nenhuma notificação encontrada.
                            </div>
                        )}
                    </section>
                </section>
            </main>
        </div>
    );
}

export default Notificacoes;