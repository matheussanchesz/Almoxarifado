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

const demandasMock: Demanda[] = [
  { prioridade: "Urgente", id: "#2024-043", titulo: "Quebra no Elevador 02", oficina: "Chassi", solicitante: "Carlos Eduardo", prazo: "21/05/2024 14:30", status: "Em Andamento" },
  { prioridade: "Urgente", id: "#2024-042", titulo: "Troca óleo do Compressor", oficina: "Pneumática", solicitante: "Mariana Costa", prazo: "21/05/2024 14:00", status: "Aguardando" },
  { prioridade: "Alta", id: "#2024-040", titulo: "Preparação Oficina de Motores", oficina: "Motores Ciclo Otto", solicitante: "Lucas Silva", prazo: "20/05/2024 08:00", status: "Em Andamento" },
  { prioridade: "Alta", id: "#2024-039", titulo: "Reposição Correia Poly-V HB20", oficina: "Oficina Veicular 01", solicitante: "João Pedro", prazo: "20/05/2024 09:15", status: "Aguardando" },
  { prioridade: "Normal", id: "#2024-038", titulo: "Organização Laboratório Elétrica", oficina: "Elétrica e Eletrônica", solicitante: "Mariana Costa", prazo: "20/05/2024 10:00", status: "Aguardando" },
  { prioridade: "Normal", id: "#2024-036", titulo: "Manutenção do Compressor", oficina: "Pneumática", solicitante: "Lucas Silva", prazo: "19/05/2024 09:45", status: "Aguardando" },
];

const abasStatus = [
  { titulo: "Todas", quantidade: 32 },
  { titulo: "Aguardando", quantidade: 9 },
  { titulo: "Em Andamento", quantidade: 10 },
  { titulo: "Concluídas", quantidade: 10 },
  { titulo: "Canceladas", quantidade: 2 },
];

function Demandas() {
  const navigate = useNavigate();
  const [buscaDemanda, setBuscaDemanda] = useState("");
  const [abaAtiva, setAbaAtiva] = useState("Todas");

  const demandasFiltradas = useMemo(() => {
    return demandasMock.filter((demanda) => {
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

      return correspondeBusca && correspondeStatus;
    });
  }, [buscaDemanda, abaAtiva]);

  return (
    <div className="demandas-layout">
      <Sidebar paginaAtiva="Demandas" />

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

            <button type="button" className="demandas-select">Todas as oficinas <FiChevronDown /></button>
            <button type="button" className="demandas-select">Todos os status <FiChevronDown /></button>
            <button type="button" className="demandas-select">Todas as prioridades <FiChevronDown /></button>

            <button type="button" className="demandas-botao-novo" onClick={() => navigate("/nova-demanda")}>
              <FiPlus />
              Nova Demanda
            </button>
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
                        <span className={`demanda-prioridade ${demanda.prioridade.toLowerCase()}`}>
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
                        <span className={`demanda-status ${demanda.status === "Em Andamento" ? "andamento" : "aguardando"}`}>
                          <span />
                          {demanda.status}
                        </span>
                      </td>
                      <td>
                        <button type="button" className="demanda-acao"><FiMoreHorizontal /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <footer className="demandas-rodape-tabela">
              <p>Exibindo 1 a {demandasFiltradas.length} de 32 demandas</p>

              <div className="demandas-paginacao">
                <button type="button"><FiChevronLeft /></button>
                <button type="button" className="ativo">1</button>
                <button type="button">2</button>
                <button type="button">3</button>
                <button type="button">4</button>
                <button type="button">5</button>
                <button type="button"><FiChevronRight /></button>
              </div>
            </footer>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Demandas;
