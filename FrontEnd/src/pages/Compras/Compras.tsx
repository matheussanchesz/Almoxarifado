import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiCheck, FiEye, FiPlus, FiSearch, FiX } from "react-icons/fi";

import Header from "../../components/Header/Header";
import Sidebar from "../../components/Sidebar/Sidebar";
import { getUsuarioLogado } from "../../services/auth";
import { temPermissao } from "../../services/permissoes";
import {
  atualizarStatusCompraApi,
  listarComprasApi,
  type SolicitacaoCompra,
} from "../../services/compras";

import "./Compras.css";

function normalizarTexto(texto: string) {
  return texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function Compras() {
  const navigate = useNavigate();
  const usuario = getUsuarioLogado();
  const podeCriar = temPermissao(usuario?.perfil, "novaCompra");
  const podeAprovar =
    usuario?.perfil === "Admin" || usuario?.perfil === "Coordenador";

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
      setErro("Não foi possível carregar as solicitações no momento.");
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
      const termo = normalizarTexto(busca);

      const correspondeBusca =
        normalizarTexto(compra.nomeItem).includes(termo) ||
        normalizarTexto(compra.categoria).includes(termo) ||
        normalizarTexto(compra.id).includes(termo);

      const correspondeStatus = !statusFiltro || compra.status === statusFiltro;

      return correspondeBusca && correspondeStatus;
    });
  }, [busca, compras, statusFiltro]);

  const total = compras.length;
  const aguardando = compras.filter((c) => c.status === "Aguardando").length;
  const aprovadas = compras.filter((c) => c.status === "Aprovado").length;
  const concluidas = compras.filter(
    (c) => normalizarTexto(c.status) === "concluido",
  ).length;

  async function atualizarStatus(id: string, status: string) {
    try {
      const compraAtualizada = await atualizarStatusCompraApi(id, status);

      setCompras((estadoAtual) =>
        estadoAtual.map((compra) =>
          compra.id === id ? compraAtualizada : compra,
        ),
      );
      setErro("");
    } catch {
      setErro("Não foi possível atualizar o status da compra.");
    }
  }

  return (
    <div className="compras-layout">
      <Sidebar />

      <main className="compras-main">
        <Header titulo="Compras" />

        <section className="compras-conteudo">
          <header className="compras-cabecalho">
            <div>
          <h1>Solicitações de Compra</h1>
          <p>Acompanhe as solicitações registradas no sistema.</p>
            </div>

            {podeCriar && (
              <button
                type="button"
                className="compras-botao-novo"
                onClick={() => navigate("/compras/nova")}
              >
                <FiPlus />
              Nova Solicitação
              </button>
            )}
          </header>

          {erro && <p style={{ color: "#b91c1c", marginBottom: 12 }}>{erro}</p>}

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
              <strong>{aprovadas}</strong>
              <span>Aprovadas</span>
            </div>

            <div className="recebido">
              <strong>{concluidas}</strong>
              <span>Concluídas</span>
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
              <option value="Aguardando">Aguardando</option>
              <option value="Aprovado">Aprovado</option>
              <option value="Rejeitado">Rejeitado</option>
              <option value="Concluído">Concluído</option>
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
                          {new Date(compra.dataSolicitacao).toLocaleDateString(
                            "pt-BR",
                          )}
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
                          className={`compras-urgencia ${normalizarTexto(
                            compra.urgencia,
                          )}`}
                        >
                          {compra.urgencia}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`compras-status ${normalizarTexto(
                            compra.status,
                          ).replaceAll(" ", "-")}`}
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

                          {podeAprovar && compra.status === "Aguardando" && (
                            <>
                              <button
                                type="button"
                                className="compras-acao aprovar"
                                title="Aprovar"
                                onClick={() =>
                                  void atualizarStatus(compra.id, "Aprovado")
                                }
                              >
                                <FiCheck />
                              </button>

                              <button
                                type="button"
                                className="compras-acao cancelar"
                                title="Rejeitar"
                                onClick={() =>
                                  void atualizarStatus(compra.id, "Rejeitado")
                                }
                              >
                                <FiX />
                              </button>
                            </>
                          )}

                          {podeAprovar && compra.status === "Aprovado" && (
                            <button
                              type="button"
                              className="compras-acao aprovar"
                              title="Concluir"
                              onClick={() =>
                                void atualizarStatus(compra.id, "Concluído")
                              }
                            >
                              <FiCheck />
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
