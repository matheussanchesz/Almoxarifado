import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiEdit2, FiEye, FiPlus, FiSearch, FiXCircle } from "react-icons/fi";

import Sidebar from "../../components/Sidebar/Sidebar";
import Header from "../../components/Header/Header";

import "./Compras.css";

type StatusCompra =
  | "Aguardando Processamento"
  | "Em Cotação"
  | "Pedido Realizado"
  | "Recebido"
  | "Cancelado";

type Compra = {
  id: string;
  data: string;
  item: string;
  especificacao: string;
  categoria: "Insumo" | "Ferramenta" | "Peça de Reposição";
  quantidade: number;
  urgencia: "Baixa" | "Média" | "Alta";
  status: StatusCompra;
};

const comprasMock: Compra[] = [
  {
    id: "COMP-001",
    data: "2026-07-01",
    item: "Torquímetro Digital",
    especificacao: "Ferramenta de precisão para aperto controlado",
    categoria: "Ferramenta",
    quantidade: 2,
    urgencia: "Alta",
    status: "Aguardando Processamento",
  },
  {
    id: "COMP-002",
    data: "2026-07-02",
    item: "Óleo lubrificante 5W30",
    especificacao: "Insumo para atividades práticas de manutenção preventiva",
    categoria: "Insumo",
    quantidade: 4,
    urgencia: "Média",
    status: "Em Cotação",
  },
];

function Compras() {
  const navigate = useNavigate();

  const [busca, setBusca] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("");

  const comprasFiltradas = useMemo(() => {
    return comprasMock.filter((compra) => {
      const termo = busca.toLowerCase();

      const correspondeBusca =
        compra.item.toLowerCase().includes(termo) ||
        compra.categoria.toLowerCase().includes(termo) ||
        compra.id.toLowerCase().includes(termo);

      const correspondeStatus = !statusFiltro || compra.status === statusFiltro;

      return correspondeBusca && correspondeStatus;
    });
  }, [busca, statusFiltro]);

  const total = comprasMock.length;
  const aguardando = comprasMock.filter(
    (c) => c.status === "Aguardando Processamento",
  ).length;
  const cotacao = comprasMock.filter((c) => c.status === "Em Cotação").length;
  const recebidos = comprasMock.filter((c) => c.status === "Recebido").length;

  return (
    <div className="compras-layout">
      <Sidebar />

      <main className="compras-main">
        <Header titulo="Compras" />

        <section className="compras-conteudo">
          <header className="compras-cabecalho">
            <div>
              <h1>Solicitações de Compra</h1>
              <p>
                Acompanhe solicitações de insumos, ferramentas e peças para o
                SENAI Automotivo.
              </p>
            </div>

            <button
              type="button"
              className="compras-botao-novo"
              onClick={() => navigate("/compras/nova")}
            >
              <FiPlus />
              Nova Solicitação
            </button>
          </header>

          <section className="compras-indicadores">
            <div>
              <strong>{total}</strong>
              <span>Total de solicitações</span>
            </div>

            <div className="aguardando">
              <strong>{aguardando}</strong>
              <span>Aguardando</span>
            </div>

            <div className="cotacao">
              <strong>{cotacao}</strong>
              <span>Em cotação</span>
            </div>

            <div className="recebido">
              <strong>{recebidos}</strong>
              <span>Recebidas</span>
            </div>
          </section>

          <section className="compras-filtros">
            <div className="compras-busca">
              <FiSearch />
              <input
                type="text"
                placeholder="Buscar por item, categoria ou código..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>

            <select
              value={statusFiltro}
              onChange={(e) => setStatusFiltro(e.target.value)}
            >
              <option value="">Todos os status</option>
              <option value="Aguardando Processamento">
                Aguardando Processamento
              </option>
              <option value="Em Cotação">Em Cotação</option>
              <option value="Pedido Realizado">Pedido Realizado</option>
              <option value="Recebido">Recebido</option>
              <option value="Cancelado">Cancelado</option>
            </select>
          </section>

          <div className="compras-card">
            <div className="compras-tabela-wrapper">
              <table className="compras-tabela">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Item</th>
                    <th>Categoria</th>
                    <th>Qtd.</th>
                    <th>Urgência</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>

                <tbody>
                  {comprasFiltradas.map((compra) => (
                    <tr key={compra.id}>
                      <td>
                        <strong className="compras-codigo">{compra.id}</strong>
                        <span className="compras-data">
                          {new Date(compra.data).toLocaleDateString("pt-BR")}
                        </span>
                      </td>

                      <td>
                        <strong className="compras-item">{compra.item}</strong>
                        <span className="compras-especificacao">
                          {compra.especificacao}
                        </span>
                      </td>

                      <td>
                        <span className="compras-categoria">
                          {compra.categoria}
                        </span>
                      </td>

                      <td>
                        <strong>{compra.quantidade}</strong>
                        <span className="compras-unidade">un.</span>
                      </td>

                      <td>
                        <span
                          className={`compras-urgencia ${compra.urgencia.toLowerCase()}`}
                        >
                          {compra.urgencia}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`compras-status ${compra.status
                            .toLowerCase()
                            .replaceAll(" ", "-")
                            .replace("ç", "c")}`}
                        >
                          {compra.status}
                        </span>
                      </td>

                      <td>
                        <div className="compras-acoes">
                          <button
                            type="button"
                            className="compras-acao"
                            title="Ver detalhes"
                            onClick={() =>
                              navigate(`/compras/detalhes/${compra.id}`)
                            }
                          >
                            <FiEye />
                          </button>

                          {compra.status === "Aguardando Processamento" && (
                            <button
                              type="button"
                              className="compras-acao editar"
                              title="Editar"
                              onClick={() =>
                                navigate(`/compras/editar/${compra.id}`)
                              }
                            >
                              <FiEdit2 />
                            </button>
                          )}

                          {compra.status !== "Recebido" &&
                            compra.status !== "Cancelado" && (
                              <button
                                type="button"
                                className="compras-acao cancelar"
                                title="Cancelar"
                                onClick={() =>
                                  confirm(
                                    `Deseja cancelar a solicitação ${compra.id}?`,
                                  )
                                }
                              >
                                <FiXCircle />
                              </button>
                            )}
                        </div>
                      </td>
                    </tr>
                  ))}

                  {comprasFiltradas.length === 0 && (
                    <tr>
                      <td colSpan={7} className="compras-vazio">
                        Nenhuma solicitação encontrada.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Compras;
