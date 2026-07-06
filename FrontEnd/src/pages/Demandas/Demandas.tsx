import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiMoreHorizontal,
  FiPlus,
  FiSearch,
} from "react-icons/fi";

import { getUsuarioLogado } from "../../services/auth";
import { listarDemandasLocais } from "../../services/localData";
import Header from "../../components/Header/Header";
import Sidebar from "../../components/Sidebar/Sidebar";

import "./Demandas.css";

type Demanda = {
  prioridade: "Urgente" | "Alta" | "Normal";
  id: string;
  titulo: string;
  oficina: string;
  solicitante: string;
  prazo: string;
  status: "Aguardando" | "Em Andamento" | "Concluída" | "Cancelada";
};

function Demandas() {
  const navigate = useNavigate();

  const usuario = getUsuarioLogado();
  const podeCriarDemanda = usuario?.perfil === "Professor";

  const [buscaDemanda, setBuscaDemanda] = useState("");
  const [abaAtiva, setAbaAtiva] = useState("Todas");

  const [demandas] = useState<Demanda[]>(() => {
    const demandasLocais = listarDemandasLocais();

    return demandasLocais.map((demanda) => ({
      prioridade: demanda.prioridade === "Baixa" ? "Normal" : demanda.prioridade,
      id: demanda.id,
      titulo: demanda.titulo,
      oficina: demanda.oficina,
      solicitante: demanda.professorNome,
      prazo: new Date(demanda.dataHoraNecessaria).toLocaleString("pt-BR"),
      status:
        demanda.status === "Aberta"
          ? "Aguardando"
          : demanda.status === "Concluída"
          ? "Concluída"
          : demanda.status === "Cancelada"
          ? "Cancelada"
          : "Em Andamento",
    }));
  });

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
      titulo: "Concluídas",
      quantidade: demandas.filter((d) => d.status === "Concluída").length,
    },
    {
      titulo: "Canceladas",
      quantidade: demandas.filter((d) => d.status === "Cancelada").length,
    },
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
        (abaAtiva === "Concluídas" && demanda.status === "Concluída") ||
        (abaAtiva === "Canceladas" && demanda.status === "Cancelada");

      const correspondePerfil =
        usuario?.perfil !== "Professor" || demanda.solicitante === usuario.nome;

      return correspondeBusca && correspondeStatus && correspondePerfil;
    });
  }, [buscaDemanda, abaAtiva, demandas, usuario]);

  return (
    <div className="demandas-layout">
      <Sidebar />

      <main className="demandas-main">
        <Header titulo="Demandas" />

        <section className="demandas-conteudo">
          <div className="demandas-cabecalho">
            <div>
              <h1>Demandas</h1>
              <p>Lista de solicitações de demandas feitas</p>
            </div>
          </div>

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

            <button type="button" className="demandas-select">
              Todas as oficinas <FiChevronDown />
            </button>
            <button type="button" className="demandas-select">
              Todos os status <FiChevronDown />
            </button>
            <button type="button" className="demandas-select">
              Todas as prioridades <FiChevronDown />
            </button>

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
                    <th>Título</th>
                    <th>Oficina / Laboratório</th>
                    <th>Solicitante</th>
                    <th>Prazo</th>
                    <th>Status</th>
                    <th>Ações</th>
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
                        <button type="button" className="demanda-acao">
                          <FiMoreHorizontal />
                        </button>
                      </td>
                    </tr>
                  ))}

                  {demandasFiltradas.length === 0 && (
                    <tr>
                      <td colSpan={8}>
                        Nenhuma demanda encontrada.
                      </td>
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