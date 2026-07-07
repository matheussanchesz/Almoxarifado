import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiEye, FiPlus, FiSearch } from "react-icons/fi";

import Header from "../../components/Header/Header";
import Sidebar from "../../components/Sidebar/Sidebar";
import {
  listarComprasApi,
  type SolicitacaoCompra,
} from "../../services/compras";

import "./Compras.css";

function Compras() {
  const navigate = useNavigate();

  const [compras, setCompras] = useState<SolicitacaoCompra[]>([]);
  const [busca, setBusca] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("");
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;

    async function carregarCompras() {
      try {
        const dados = await listarComprasApi();

        if (ativo) {
          setCompras(dados);
          setErro("");
        }
      } catch {
        if (ativo) {
          setErro("Nao foi possivel carregar as solicitacoes da API.");
        }
      }
    }

    void carregarCompras();

    return () => {
      ativo = false;
    };
  }, []);

  const comprasFiltradas = useMemo(() => {
    return compras.filter((compra) => {
      const termo = busca.toLowerCase();

      const correspondeBusca =
        compra.nomeItem.toLowerCase().includes(termo) ||
        compra.categoria.toLowerCase().includes(termo) ||
        compra.id.toLowerCase().includes(termo);

      const correspondeStatus = !statusFiltro || compra.status === statusFiltro;

      return correspondeBusca && correspondeStatus;
    });
  }, [busca, compras, statusFiltro]);

  const total = compras.length;
  const aguardando = compras.filter((c) => c.status === "Aguardando").length;
  const aprovadas = compras.filter((c) => c.status === "Aprovado").length;
  const concluidas = compras.filter((c) => c.status === "Concluido" || c.status === "Concluído").length;

  return (
    <div className="compras-layout">
      <Sidebar />

      <main className="compras-main">
        <Header titulo="Compras" />

        <section className="compras-conteudo">
          <header className="compras-cabecalho">
            <div>
              <h1>Solicitacoes de Compra</h1>
              <p>Acompanhe solicitacoes reais registradas na API.</p>
            </div>

            <button
              type="button"
              className="compras-botao-novo"
              onClick={() => navigate("/compras/nova")}
            >
              <FiPlus />
              Nova Solicitacao
            </button>
          </header>

          {erro && <p style={{ color: "#b91c1c", marginBottom: 12 }}>{erro}</p>}

          <section className="compras-indicadores">
            <div>
              <strong>{total}</strong>
              <span>Total de solicitacoes</span>
            </div>

            <div className="aguardando">
              <strong>{aguardando}</strong>
              <span>Aguardando</span>
            </div>

            <div className="cotacao">
              <strong>{aprovadas}</strong>
              <span>Aprovadas</span>
            </div>

            <div className="recebido">
              <strong>{concluidas}</strong>
              <span>Concluidas</span>
            </div>
          </section>

          <section className="compras-filtros">
            <div className="compras-busca">
              <FiSearch />
              <input
                type="text"
                placeholder="Buscar por item, categoria ou codigo..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>

            <select
              value={statusFiltro}
              onChange={(e) => setStatusFiltro(e.target.value)}
            >
              <option value="">Todos os status</option>
              <option value="Aguardando">Aguardando</option>
              <option value="Aprovado">Aprovado</option>
              <option value="Rejeitado">Rejeitado</option>
              <option value="Concluido">Concluido</option>
              <option value="Concluído">Concluido</option>
            </select>
          </section>

          <div className="compras-card">
            <div className="compras-tabela-wrapper">
              <table className="compras-tabela">
                <thead>
                  <tr>
                    <th>Codigo</th>
                    <th>Item</th>
                    <th>Categoria</th>
                    <th>Qtd.</th>
                    <th>Urgencia</th>
                    <th>Status</th>
                    <th>Acoes</th>
                  </tr>
                </thead>

                <tbody>
                  {comprasFiltradas.map((compra) => (
                    <tr key={compra.id}>
                      <td>
                        <strong className="compras-codigo">{compra.id}</strong>
                        <span className="compras-data">
                          {new Date(compra.dataSolicitacao).toLocaleDateString("pt-BR")}
                        </span>
                      </td>

                      <td>
                        <strong className="compras-item">{compra.nomeItem}</strong>
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
                            .normalize("NFD")
                            .replace(/[\u0300-\u036f]/g, "")}`}
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
                        </div>
                      </td>
                    </tr>
                  ))}

                  {comprasFiltradas.length === 0 && (
                    <tr>
                      <td colSpan={7} className="compras-vazio">
                        Nenhuma solicitacao encontrada.
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
