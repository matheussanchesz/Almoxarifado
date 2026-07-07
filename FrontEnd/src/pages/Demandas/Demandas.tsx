import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiEye,
  FiPlus,
  FiSearch,
} from "react-icons/fi";

import Header from "../../components/Header/Header";
import Sidebar from "../../components/Sidebar/Sidebar";
import { getUsuarioLogado } from "../../services/auth";
import { listarDemandasApi, type DemandaApi } from "../../services/demandas";

import "./Demandas.css";

type DemandaTabela = {
  prioridade: "Urgente" | "Alta" | "Normal";
  id: string;
  titulo: string;
  oficina: string;
  solicitante: string;
  prazo: string;
  status: "Aguardando" | "Em Andamento" | "Concluida" | "Cancelada";
};

function normalizar(valor: string) {
  return valor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function mapearStatus(status: string): DemandaTabela["status"] {
  const statusNormalizado = normalizar(status);

  if (status === "Aberta" || statusNormalizado === "em analise") {
    return "Aguardando";
  }

  if (statusNormalizado === "concluida") {
    return "Concluida";
  }

  if (status === "Cancelada") {
    return "Cancelada";
  }

  return "Em Andamento";
}

function mapearDemanda(demanda: DemandaApi): DemandaTabela {
  return {
    prioridade:
      demanda.prioridade === "Baixa" ? "Normal" : demanda.prioridade,
    id: demanda.id,
    titulo: demanda.titulo,
    oficina: demanda.oficina,
    solicitante: demanda.professorNome,
    prazo: new Date(demanda.dataHoraNecessaria).toLocaleString("pt-BR"),
    status: mapearStatus(demanda.status),
  };
}

function Demandas() {
  const navigate = useNavigate();
  const usuario = getUsuarioLogado();
  const podeCriarDemanda = usuario?.perfil === "Professor";

  const [buscaDemanda, setBuscaDemanda] = useState("");
  const [abaAtiva, setAbaAtiva] = useState("Todas");
  const [filtroOficina, setFiltroOficina] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");
  const [filtroPrioridade, setFiltroPrioridade] = useState("");
  const [demandas, setDemandas] = useState<DemandaTabela[]>([]);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;

    async function carregarDemandas() {
      try {
        const dados = await listarDemandasApi();

        if (ativo) {
          setDemandas(dados.map(mapearDemanda));
          setErro("");
        }
      } catch {
        if (ativo) {
          setErro("Nao foi possivel carregar as demandas da API.");
        }
      }
    }

    void carregarDemandas();

    return () => {
      ativo = false;
    };
  }, []);

  const abasStatus = [
    { titulo: "Todas", quantidade: demandas.length },
    {
      titulo: "Aguardando",
      quantidade: demandas.filter((d) => d.status === "Aguardando").length,
    },
    {
      titulo: "Em Andamento",
      quantidade: demandas.filter((d) => d.status === "Em Andamento").length,
    },
    {
      titulo: "Concluidas",
      quantidade: demandas.filter((d) => d.status === "Concluida").length,
    },
    {
      titulo: "Canceladas",
      quantidade: demandas.filter((d) => d.status === "Cancelada").length,
    },
  ];

  const oficinasDisponiveis = [...new Set(demandas.map((d) => d.oficina))];
  const prioridadesDisponiveis = [
    ...new Set(demandas.map((d) => d.prioridade)),
  ];

  const demandasFiltradas = useMemo(() => {
    return demandas.filter((demanda) => {
      const busca = buscaDemanda.toLowerCase();

      const correspondeBusca =
        demanda.titulo.toLowerCase().includes(busca) ||
        demanda.id.toLowerCase().includes(busca) ||
        demanda.solicitante.toLowerCase().includes(busca);

      const correspondeStatus =
        abaAtiva === "Todas" ||
        demanda.status === abaAtiva ||
        (abaAtiva === "Concluidas" && demanda.status === "Concluida") ||
        (abaAtiva === "Canceladas" && demanda.status === "Cancelada");

      const correspondePerfil =
        usuario?.perfil !== "Professor" || demanda.solicitante === usuario.nome;
      const correspondeOficina =
        !filtroOficina || demanda.oficina === filtroOficina;
      const correspondeFiltroStatus =
        !filtroStatus || demanda.status === filtroStatus;
      const correspondePrioridade =
        !filtroPrioridade || demanda.prioridade === filtroPrioridade;

      return (
        correspondeBusca &&
        correspondeStatus &&
        correspondeFiltroStatus &&
        correspondeOficina &&
        correspondePrioridade &&
        correspondePerfil
      );
    });
  }, [
    buscaDemanda,
    abaAtiva,
    demandas,
    usuario,
    filtroOficina,
    filtroStatus,
    filtroPrioridade,
  ]);

  return (
    <div className="demandas-layout">
      <Sidebar />

      <main className="demandas-main">
        <Header titulo="Demandas" />

        <section className="demandas-conteudo">
          <div className="demandas-cabecalho">
            <div>
              <h1>Demandas</h1>
              <p>Lista de solicitacoes carregadas da API.</p>
            </div>
          </div>

          {erro && <p style={{ color: "#b91c1c", marginBottom: 12 }}>{erro}</p>}

          <div className="demandas-filtros">
            <div className="demandas-busca">
              <FiSearch />
              <input
                type="text"
                placeholder="Buscar demanda..."
                value={buscaDemanda}
                onChange={(evento) => setBuscaDemanda(evento.target.value)}
              />
            </div>

            <div className="demandas-select">
              <select
                value={filtroOficina}
                onChange={(evento) => setFiltroOficina(evento.target.value)}
              >
                <option value="">Todas as oficinas</option>
                {oficinasDisponiveis.map((oficina) => (
                  <option key={oficina} value={oficina}>
                    {oficina}
                  </option>
                ))}
              </select>
              <FiChevronDown />
            </div>

            <div className="demandas-select">
              <select
                value={filtroStatus}
                onChange={(evento) => setFiltroStatus(evento.target.value)}
              >
                <option value="">Todos os status</option>
                <option value="Aguardando">Aguardando</option>
                <option value="Em Andamento">Em Andamento</option>
                <option value="Concluida">Concluida</option>
                <option value="Cancelada">Cancelada</option>
              </select>
              <FiChevronDown />
            </div>

            <div className="demandas-select">
              <select
                value={filtroPrioridade}
                onChange={(evento) => setFiltroPrioridade(evento.target.value)}
              >
                <option value="">Todas as prioridades</option>
                {prioridadesDisponiveis.map((prioridade) => (
                  <option key={prioridade} value={prioridade}>
                    {prioridade}
                  </option>
                ))}
              </select>
              <FiChevronDown />
            </div>

            {podeCriarDemanda && (
              <button
                type="button"
                className="demandas-botao-novo"
                onClick={() => navigate("/nova-demanda")}
              >
                <FiPlus />
                Nova Demanda
              </button>
            )}
          </div>

          <div className="demandas-abas">
            {abasStatus.map((aba) => (
              <button
                key={aba.titulo}
                type="button"
                className={abaAtiva === aba.titulo ? "ativo" : ""}
                onClick={() => setAbaAtiva(aba.titulo)}
              >
                {aba.titulo}
                <span>{aba.quantidade}</span>
              </button>
            ))}
          </div>

          <div className="demandas-tabela-card">
            <div className="demandas-tabela-area">
              <table className="demandas-tabela">
                <thead>
                  <tr>
                    <th>Prioridade</th>
                    <th>ID</th>
                    <th>Titulo</th>
                    <th>Oficina / Laboratorio</th>
                    <th>Solicitante</th>
                    <th>Prazo</th>
                    <th>Status</th>
                    <th>Acoes</th>
                  </tr>
                </thead>

                <tbody>
                  {demandasFiltradas.map((demanda) => (
                    <tr key={demanda.id}>
                      <td>
                        <span
                          className={`demanda-prioridade ${demanda.prioridade.toLowerCase()}`}
                        >
                          <span />
                          {demanda.prioridade}
                        </span>
                      </td>
                      <td>{demanda.id}</td>
                      <td>{demanda.titulo}</td>
                      <td>{demanda.oficina}</td>
                      <td>{demanda.solicitante}</td>
                      <td>{demanda.prazo}</td>
                      <td>
                        <span
                          className={`demanda-status ${
                            demanda.status === "Em Andamento"
                              ? "andamento"
                              : "aguardando"
                          }`}
                        >
                          <span />
                          {demanda.status}
                        </span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="demanda-acao"
                          title="Ver detalhes"
                          onClick={() =>
                            navigate(`/demandas/detalhes/${demanda.id}`)
                          }
                        >
                          <FiEye />
                        </button>
                      </td>
                    </tr>
                  ))}

                  {demandasFiltradas.length === 0 && (
                    <tr>
                      <td colSpan={8}>Nenhuma demanda encontrada.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <footer className="demandas-rodape-tabela">
              <p>
                Exibindo {demandasFiltradas.length > 0 ? 1 : 0} a{" "}
                {demandasFiltradas.length} de {demandas.length} demandas
              </p>

              <div className="demandas-paginacao">
                <button type="button">
                  <FiChevronLeft />
                </button>
                <button type="button" className="ativo">
                  1
                </button>
                <button type="button">
                  <FiChevronRight />
                </button>
              </div>
            </footer>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Demandas;
