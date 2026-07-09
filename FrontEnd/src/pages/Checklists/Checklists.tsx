import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { FiCopy, FiEdit2, FiPlus, FiSearch, FiTrash2, FiX } from "react-icons/fi";

import Header from "../../components/Header/Header";
import Sidebar from "../../components/Sidebar/Sidebar";
import { getUsuarioLogado } from "../../services/auth";
import {
  criarChecklistApi,
  duplicarChecklistApi,
  editarChecklistApi,
  excluirChecklistApi,
  listarChecklistsApi,
  type ChecklistApi,
} from "../../services/checklists";

import "./Checklists.css";

function Checklists() {
  const navigate = useNavigate();
  const usuario = getUsuarioLogado();
  const podeExcluir = usuario?.perfil === "Admin";

  const [modelos, setModelos] = useState<ChecklistApi[]>([]);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");
  const [modalAberto, setModalAberto] = useState(false);
  const [modeloEditando, setModeloEditando] = useState<ChecklistApi | null>(null);
  const [nome, setNome] = useState("");
  const [oficina, setOficina] = useState("");
  const [categoria, setCategoria] = useState("");
  const [itemAtual, setItemAtual] = useState("");
  const [itens, setItens] = useState<string[]>([]);
  const [erro, setErro] = useState("");

  async function recarregarModelos() {
    try {
      const dados = await listarChecklistsApi(false);
      setModelos(dados);
      setErro("");
    } catch {
      setErro("Nao foi possivel carregar os checklists no momento.");
    }
  }

  useEffect(() => {
    let ativo = true;

    async function carregarModelos() {
      try {
        const dados = await listarChecklistsApi(false);

        if (ativo) {
          setModelos(dados);
          setErro("");
        }
      } catch {
        if (ativo) {
          setErro("Nao foi possivel carregar os checklists no momento.");
        }
      }
    }

    void carregarModelos();

    return () => {
      ativo = false;
    };
  }, []);

  const indicadores = useMemo(() => {
    return {
      total: modelos.length,
      executados: 0,
      rascunhos: 0,
      inativos: modelos.filter((modelo) => !modelo.ativo).length,
    };
  }, [modelos]);

  const modelosFiltrados = useMemo(() => {
    const termo = busca.toLowerCase();

    return modelos
      .filter((modelo) => {
        const correspondeBusca =
          modelo.nome.toLowerCase().includes(termo) ||
          modelo.oficina.toLowerCase().includes(termo) ||
          modelo.descricao.toLowerCase().includes(termo);

        const correspondeStatus =
          !filtroStatus ||
          (filtroStatus === "Inativo" ? !modelo.ativo : modelo.ativo);

        return correspondeBusca && correspondeStatus;
      })
      .sort((a, b) => Number(b.ativo) - Number(a.ativo));
  }, [busca, filtroStatus, modelos]);

  function limparFormulario() {
    setNome("");
    setOficina("");
    setCategoria("");
    setItemAtual("");
    setItens([]);
    setModeloEditando(null);
  }

  function abrirNovoChecklist() {
    limparFormulario();
    setModalAberto(true);
  }

  function abrirEdicao(modelo: ChecklistApi) {
    setModeloEditando(modelo);
    setNome(modelo.nome);
    setOficina(modelo.oficina);
    setCategoria(modelo.itens[0]?.categoria ?? "");
    setItens(modelo.itens.map((item) => item.descricao));
    setItemAtual("");
    setModalAberto(true);
  }

  function adicionarItem() {
    const itemTratado = itemAtual.trim();

    if (!itemTratado) {
      alert("Digite um item para adicionar.");
      return;
    }

    setItens((itensAtuais) => [...itensAtuais, itemTratado]);
    setItemAtual("");
  }

  function removerItem(index: number) {
    setItens((itensAtuais) =>
      itensAtuais.filter((_, indice) => indice !== index),
    );
  }

  async function salvarChecklist(evento: FormEvent) {
    evento.preventDefault();

    if (!nome || !oficina || !categoria || itens.length === 0) {
      alert("Preencha nome, oficina, categoria e pelo menos um item.");
      return;
    }

    try {
      if (modeloEditando) {
        await editarChecklistApi(modeloEditando.id, {
          nome,
          descricao: categoria,
          oficina,
          ativo: modeloEditando.ativo,
          itens: itens.map((item, index) => ({
            id: modeloEditando.itens[index]?.id ?? "",
            descricao: item,
            categoria,
          })),
        });
      } else {
        await criarChecklistApi({
          nome,
          descricao: categoria,
          oficina,
          itens: itens.map((item) => ({ descricao: item, categoria })),
        });
      }

      limparFormulario();
      setModalAberto(false);
      await recarregarModelos();
    } catch {
      setErro("Nao foi possivel salvar o checklist. Confira os dados e tente novamente.");
    }
  }

  async function duplicarModelo(id: string) {
    await duplicarChecklistApi(id);
    await recarregarModelos();
  }

  async function excluirModelo(id: string) {
    const confirmar = window.confirm("Deseja excluir este checklist?");
    if (!confirmar) return;

    await excluirChecklistApi(id);
    await recarregarModelos();
  }

  async function alternarStatus(modelo: ChecklistApi) {
    await editarChecklistApi(modelo.id, {
      nome: modelo.nome,
      descricao: modelo.descricao,
      oficina: modelo.oficina,
      ativo: !modelo.ativo,
      itens: modelo.itens,
    });
    await recarregarModelos();
  }

  return (
    <div className="checklists-layout">
      <Sidebar />

      <main className="checklists-main">
        <Header titulo="Checklists" />

        <section className="checklists-conteudo">
          <header className="checklists-cabecalho">
            <div>
              <h1>Modelos de Checklists</h1>
              <p>Modelos cadastrados para execucao operacional.</p>
            </div>

            <div className="checklists-acoes-cabecalho">
              <button
                type="button"
                className="checklists-botao-historico"
                onClick={() => navigate("/checklists/historico")}
              >
                Historico de Execucoes
              </button>

              <button
                type="button"
                className="checklists-botao-novo"
                onClick={abrirNovoChecklist}
              >
                <FiPlus />
                Novo checklist
              </button>
            </div>
          </header>

          {erro && <p style={{ color: "#b91c1c", marginBottom: 12 }}>{erro}</p>}

          <section className="checklists-indicadores">
            <article>
              <strong>{indicadores.total}</strong>
              <span>Total</span>
            </article>
            <article>
              <strong>{indicadores.executados}</strong>
              <span>Executados</span>
            </article>
            <article>
              <strong>{indicadores.rascunhos}</strong>
              <span>Rascunhos</span>
            </article>
            <article>
              <strong>{indicadores.inativos}</strong>
              <span>Inativos</span>
            </article>
          </section>

          <section className="checklists-filtros">
            <div className="checklists-busca">
              <FiSearch />
              <input
                type="text"
                placeholder="Buscar checklist..."
                value={busca}
                onChange={(evento) => setBusca(evento.target.value)}
              />
            </div>

            <select
              value={filtroStatus}
              onChange={(evento) => setFiltroStatus(evento.target.value)}
            >
              <option value="">Todos</option>
              <option value="Ativo">Ativos</option>
              <option value="Inativo">Inativos</option>
            </select>
          </section>

          <section className="checklists-lista">
            {modelosFiltrados.map((modelo) => (
              <article
                key={modelo.id}
                className={`checklists-card ${!modelo.ativo ? "inativo" : ""}`}
              >
                <div className="checklists-card-topo">
                  <div>
                    <h2>{modelo.nome}</h2>
                    <p>{modelo.oficina}</p>
                  </div>
                  <span>{modelo.ativo ? "Ativo" : "Inativo"}</span>
                </div>

                <p>{modelo.descricao || "Sem descricao."}</p>
                <small>{modelo.itens.length} item(ns)</small>

                <footer>
                  <button
                    type="button"
                    onClick={() => navigate(`/checklists/execucao/${modelo.id}`)}
                  >
                    Executar
                  </button>
                  <button type="button" onClick={() => abrirEdicao(modelo)}>
                    <FiEdit2 />
                  </button>
                  <button
                    type="button"
                    onClick={() => void duplicarModelo(modelo.id)}
                  >
                    <FiCopy />
                  </button>
                  <button type="button" onClick={() => void alternarStatus(modelo)}>
                    {modelo.ativo ? "Inativar" : "Ativar"}
                  </button>
                  {podeExcluir && (
                    <button
                      type="button"
                      className="danger"
                      onClick={() => void excluirModelo(modelo.id)}
                    >
                      <FiTrash2 />
                    </button>
                  )}
                </footer>
              </article>
            ))}

            {modelosFiltrados.length === 0 && (
              <div className="checklists-vazio">Nenhum checklist encontrado.</div>
            )}
          </section>
        </section>
      </main>

      {modalAberto && (
        <div className="checklists-modal-fundo" onClick={() => setModalAberto(false)}>
          <aside
            className="checklists-modal"
            onClick={(evento) => evento.stopPropagation()}
          >
            <header>
              <div>
                <h2>{modeloEditando ? "Editar checklist" : "Novo checklist"}</h2>
                <p>Salve o modelo para uso nas execucoes.</p>
              </div>
              <button type="button" onClick={() => setModalAberto(false)}>
                <FiX />
              </button>
            </header>

            <form onSubmit={salvarChecklist}>
              <label>
                Nome
                <input
                  value={nome}
                  onChange={(evento) => setNome(evento.target.value)}
                  required
                />
              </label>
              <label>
                Oficina
                <input
                  value={oficina}
                  onChange={(evento) => setOficina(evento.target.value)}
                  required
                />
              </label>
              <label>
                Categoria
                <input
                  value={categoria}
                  onChange={(evento) => setCategoria(evento.target.value)}
                  required
                />
              </label>
              <label>
                Novo item
                <div className="checklists-item-input">
                  <input
                    value={itemAtual}
                    onChange={(evento) => setItemAtual(evento.target.value)}
                  />
                  <button type="button" onClick={adicionarItem}>
                    Adicionar
                  </button>
                </div>
              </label>

              <ul className="checklists-itens">
                {itens.map((item, index) => (
                  <li key={`${item}-${index}`}>
                    {item}
                    <button type="button" onClick={() => removerItem(index)}>
                      <FiX />
                    </button>
                  </li>
                ))}
              </ul>

              <div className="checklists-modal-acoes">
                <button type="button" onClick={() => setModalAberto(false)}>
                  Cancelar
                </button>
                <button type="submit">Salvar</button>
              </div>
            </form>
          </aside>
        </div>
      )}
    </div>
  );
}

export default Checklists;
