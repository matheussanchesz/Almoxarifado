import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiCopy,
  FiEdit2,
  FiPlus,
  FiSearch,
  FiTrash2,
  FiToggleLeft,
  FiToggleRight,
  FiX,
} from "react-icons/fi";

import Sidebar from "../../components/Sidebar/Sidebar";
import {
  alternarStatusModeloChecklist,
  criarModeloChecklist,
  duplicarModeloChecklist,
  editarModeloChecklist,
  excluirModeloChecklist,
  listarExecucoesChecklist,
  listarModelosChecklist,
  obterRascunhoChecklist,
  type ModeloChecklist,
} from "../../services/checklistsLocal";
import Header from "../../components/Header/Header";
import "./Checklists.css";

function formatarData(data: string) {
  return new Date(data).toLocaleString("pt-BR");
}

function Checklists() {
  const navigate = useNavigate();

  const [modelos, setModelos] = useState<ModeloChecklist[]>(() =>
    listarModelosChecklist()
  );

  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");
  const [modalAberto, setModalAberto] = useState(false);
  const [modeloEditando, setModeloEditando] = useState<ModeloChecklist | null>(
    null
  );

  const [nome, setNome] = useState("");
  const [oficina, setOficina] = useState("");
  const [categoria, setCategoria] = useState("");
  const [itemAtual, setItemAtual] = useState("");
  const [itens, setItens] = useState<string[]>([]);

  const execucoes = listarExecucoesChecklist();

  function obterInfoModelo(modelo: ModeloChecklist) {
    const rascunho = obterRascunhoChecklist(modelo.id);

    const execucoesDoModelo = execucoes
      .filter((execucao) => execucao.modeloId === modelo.id)
      .sort(
        (a, b) =>
          new Date(b.dataExecucao).getTime() -
          new Date(a.dataExecucao).getTime()
      );

    const ultimaExecucao = execucoesDoModelo[0];

    if (rascunho) {
      return {
        status: "Rascunho",
        classe: "rascunho",
        botao: "Continuar execução",
        ultimaExecucao: ultimaExecucao
          ? formatarData(ultimaExecucao.dataExecucao)
          : "—",
        ultimoAlmoxarife: rascunho.almoxarifeNome,
      };
    }

    if (ultimaExecucao) {
      return {
        status: "Executado",
        classe: "executado",
        botao: "Executar novamente",
        ultimaExecucao: formatarData(ultimaExecucao.dataExecucao),
        ultimoAlmoxarife: ultimaExecucao.almoxarifeNome,
      };
    }

    return {
      status: "Nunca executado",
      classe: "nunca",
      botao: "Executar",
      ultimaExecucao: "Nunca",
      ultimoAlmoxarife: "—",
    };
  }

  const modelosComInfo = useMemo(() => {
    return modelos.map((modelo) => ({
      ...modelo,
      info: obterInfoModelo(modelo),
    }));
  }, [modelos, execucoes]);

  const indicadores = useMemo(() => {
    return {
      total: modelos.length,
      executados: modelosComInfo.filter((m) => m.info.status === "Executado")
        .length,
      rascunhos: modelosComInfo.filter((m) => m.info.status === "Rascunho")
        .length,
      inativos: modelos.filter((modelo) => !modelo.ativo).length,
    };
  }, [modelos, modelosComInfo]);

  const modelosFiltrados = useMemo(() => {
    const termo = busca.toLowerCase();

    return modelosComInfo
      .filter((modelo) => {
        const correspondeBusca =
          modelo.nome.toLowerCase().includes(termo) ||
          modelo.oficina.toLowerCase().includes(termo) ||
          modelo.categoria.toLowerCase().includes(termo);

        let correspondeStatus = true;

        if (filtroStatus === "Inativo") {
          correspondeStatus = !modelo.ativo;
        } else if (filtroStatus !== "") {
          correspondeStatus = modelo.info.status === filtroStatus;
        }

        return correspondeBusca && correspondeStatus;
      })
      .sort((a, b) => {
        // Ativos primeiro, inativos por último
        if (a.ativo === b.ativo) return 0;
        return a.ativo ? -1 : 1;
      });
  }, [busca, filtroStatus, modelosComInfo]);

  function recarregarModelos() {
    setModelos(listarModelosChecklist());
  }

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

  function abrirEdicao(modelo: ModeloChecklist) {
    setModeloEditando(modelo);
    setNome(modelo.nome);
    setOficina(modelo.oficina);
    setCategoria(modelo.categoria);
    setItens(modelo.itens);
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
      itensAtuais.filter((_, indice) => indice !== index)
    );
  }

  function salvarChecklist(evento: React.FormEvent) {
    evento.preventDefault();

    if (!nome || !oficina || !categoria || itens.length === 0) {
      alert("Preencha nome, oficina, categoria e pelo menos um item.");
      return;
    }

    if (modeloEditando) {
      editarModeloChecklist(modeloEditando.id, {
        nome,
        oficina,
        categoria,
        itens,
      });
    } else {
      criarModeloChecklist({
        nome,
        oficina,
        categoria,
        itens,
      });
    }

    limparFormulario();
    setModalAberto(false);
    recarregarModelos();
  }

  function duplicarModelo(id: string) {
    duplicarModeloChecklist(id);
    recarregarModelos();
  }

  function alterarStatus(id: string) {
    const modelo = modelos.find((item) => item.id === id);

    if (!modelo) return;

    const mensagem = modelo.ativo
      ? "Deseja inativar este modelo? Ele não poderá mais ser executado, mas o histórico será preservado."
      : "Deseja reativar este modelo para permitir novas execuções?";

    const confirmou = confirm(mensagem);

    if (!confirmou) return;

    alternarStatusModeloChecklist(id);
    recarregarModelos();
  }

  function removerModelo(id: string) {
    const confirmou = confirm(
      "Deseja realmente excluir este modelo de checklist?"
    );

    if (!confirmou) return;

    excluirModeloChecklist(id);
    recarregarModelos();
  }

  return (
    <div className="checklists-layout">
      <Sidebar />

      <main className="checklists-main">
        <Header titulo="Checklists" />
        <Header titulo="Checklists" />
        <section className="checklists-conteudo">
          <header className="checklists-cabecalho">
            <div>
              <h1>Modelos de Checklists</h1>
              <p>
                Gerencie os modelos de inspeção das oficinas do SENAI
                Automotivo.
              </p>
            </div>

            <div className="checklists-acoes-cabecalho">
              <button
                type="button"
                className="checklists-botao-historico"
                onClick={() => navigate("/checklists/historico")}
              >
                Histórico de Execuções
              </button>

              <button
                type="button"
                className="checklists-botao-novo"
                onClick={abrirNovoChecklist}
              >
                <FiPlus />
                Novo Checklist
              </button>
            </div>
          </header>

          <section className="checklists-indicadores">
            <div>
              <strong>{indicadores.total}</strong>
              <span>Modelos cadastrados</span>
            </div>

            <div className="executado">
              <strong>{indicadores.executados}</strong>
              <span>Já executados</span>
            </div>

            <div className="rascunho">
              <strong>{indicadores.rascunhos}</strong>
              <span>Com rascunho</span>
            </div>

            <div className="nunca">
              <strong>{indicadores.inativos}</strong>
              <span>Modelos inativos</span>
            </div>
          </section>

          <section className="checklists-filtros">
            <div className="checklists-busca">
              <FiSearch />
              <input
                type="text"
                placeholder="Buscar por modelo, oficina ou categoria..."
                value={busca}
                onChange={(evento) => setBusca(evento.target.value)}
              />
            </div>

            <select
              value={filtroStatus}
              onChange={(evento) => setFiltroStatus(evento.target.value)}
            >
              <option value="">Todos</option>
              <option value="Executado">Executados</option>
              <option value="Rascunho">Rascunhos</option>
              <option value="Nunca executado">Nunca executados</option>
              <option value="Inativo">Modelos inativos</option>
            </select>
          </section>

          <div className="checklists-card">
            <div className="checklists-tabela-wrapper">
              <table className="checklists-tabela">
                <thead>
                  <tr>
                    <th>Modelo</th>
                    <th>Oficina</th>
                    <th>Categoria</th>
                    <th>Situação</th>
                    <th>Última execução</th>
                    <th>Último almoxarife</th>
                    <th>Execução</th>
                    <th>Ações</th>
                  </tr>
                </thead>

                <tbody>
                  {modelosFiltrados.map((modelo) => (
                    <tr
                      key={modelo.id}
                      className={!modelo.ativo ? "modelo-inativo" : ""}
                    >
                      <td>
                        <strong className="checklists-modelo-nome">
                          {modelo.nome}
                        </strong>
                        <span className="checklists-modelo-descricao">
                          {modelo.itens.length} itens cadastrados
                        </span>
                      </td>

                      <td>{modelo.oficina}</td>

                      <td>
                        <span className="checklists-categoria">
                          {modelo.categoria}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`checklists-situacao-modelo ${
                            modelo.ativo ? "ativo" : "inativo"
                          }`}
                        >
                          {modelo.ativo ? "Ativo" : "Inativo"}
                        </span>
                      </td>

                      <td>{modelo.info.ultimaExecucao}</td>
                      <td>{modelo.info.ultimoAlmoxarife}</td>

                      <td>
                        <span
                          className={`checklists-status-inteligente ${modelo.info.classe}`}
                        >
                          {modelo.info.status}
                        </span>
                      </td>
                      <td>
                        <div className="checklists-acoes">
                          {modelo.ativo ? (
                            <button
                              type="button"
                              className="checklists-executar"
                              onClick={() =>
                                navigate(`/checklists/execucao/${modelo.id}`)
                              }
                            >
                              {modelo.info.botao}
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="checklists-executar inativo"
                              disabled
                            >
                              Modelo inativo
                            </button>
                          )}

                          <button
                            type="button"
                            className="checklists-acao"
                            title="Editar"
                            onClick={() => abrirEdicao(modelo)}
                          >
                            <FiEdit2 />
                          </button>

                          <button
                            type="button"
                            className="checklists-acao"
                            title="Duplicar"
                            onClick={() => duplicarModelo(modelo.id)}
                          >
                            <FiCopy />
                          </button>

                          <button
                            type="button"
                            className={`checklists-acao-status ${
                              modelo.ativo ? "inativar" : "ativar"
                            }`}
                            title={
                              modelo.ativo
                                ? "Inativar modelo"
                                : "Reativar modelo"
                            }
                            onClick={() => alterarStatus(modelo.id)}
                          >
                            {modelo.ativo ? "Inativar" : "Reativar"}
                          </button>

                          <button
                            type="button"
                            className="checklists-acao perigo"
                            title="Excluir"
                            onClick={() => removerModelo(modelo.id)}
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {modelosFiltrados.length === 0 && (
                    <tr>
                      <td colSpan={7} className="checklists-vazio">
                        Nenhum modelo encontrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <footer className="checklists-rodape">
              <p>
                Mostrando {modelosFiltrados.length} de {modelos.length} modelos
              </p>
            </footer>
          </div>
        </section>
      </main>

      {modalAberto && (
        <div className="checklists-modal-fundo">
          <form className="checklists-modal" onSubmit={salvarChecklist}>
            <header className="checklists-modal-header">
              <div>
                <h2>
                  {modeloEditando ? "Editar Checklist" : "Novo Checklist"}
                </h2>
                <p>
                  Monte um modelo de conferência para oficinas, ferramentas,
                  equipamentos e veículos do SENAI Automotivo.
                </p>
              </div>

              <button
                type="button"
                className="checklists-modal-fechar"
                onClick={() => {
                  limparFormulario();
                  setModalAberto(false);
                }}
              >
                ×
              </button>
            </header>

            <div className="checklists-modal-grid">
              <label>
                Nome do modelo
                <input
                  type="text"
                  placeholder="Ex.: Checklist - Chassi e Suspensão"
                  value={nome}
                  onChange={(evento) => setNome(evento.target.value)}
                />
              </label>

              <label>
                Oficina automotiva
                <select
                  value={oficina}
                  onChange={(evento) => setOficina(evento.target.value)}
                >
                  <option value="">Selecione</option>
                  <option value="Motores Ciclo Otto">Motores Ciclo Otto</option>
                  <option value="Motores Ciclo Diesel">
                    Motores Ciclo Diesel
                  </option>
                  <option value="Elétrica e Eletrônica Automotiva">
                    Elétrica e Eletrônica Automotiva
                  </option>
                  <option value="Chassi e Suspensão">Chassi e Suspensão</option>
                  <option value="Freios">Freios</option>
                  <option value="Transmissão">Transmissão</option>
                  <option value="Diagnóstico Automotivo">
                    Diagnóstico Automotivo
                  </option>
                  <option value="Pneumática">Pneumática</option>
                </select>
              </label>
            </div>

            <section className="checklists-categorias">
              <strong>Categoria do checklist</strong>

              <div className="checklists-categorias-grid">
                {[
                  "Ferramentas",
                  "Equipamentos",
                  "Veículos",
                  "Segurança",
                  "Organização",
                ].map((opcao) => (
                  <button
                    key={opcao}
                    type="button"
                    className={categoria === opcao ? "ativo" : ""}
                    onClick={() => setCategoria(opcao)}
                  >
                    {opcao}
                  </button>
                ))}
              </div>
            </section>

            <section className="checklists-itens-bloco">
              <div className="checklists-itens-topo">
                <div>
                  <h3>Itens do Checklist</h3>
                  <p>Adicione cada item que o almoxarife deverá conferir.</p>
                </div>

                <span>{itens.length} itens</span>
              </div>

              <div className="checklists-adicionar-item">
                <input
                  type="text"
                  placeholder="Ex.: Conferir torquímetros"
                  value={itemAtual}
                  onChange={(evento) => setItemAtual(evento.target.value)}
                  onKeyDown={(evento) => {
                    if (evento.key === "Enter") {
                      evento.preventDefault();
                      adicionarItem();
                    }
                  }}
                />

                <button type="button" onClick={adicionarItem}>
                  <FiPlus />
                  Adicionar
                </button>
              </div>

              <div className="checklists-lista-itens">
                {itens.map((item, index) => (
                  <div className="checklists-item" key={`${item}-${index}`}>
                    <span>
                      <strong>{index + 1}.</strong> {item}
                    </span>

                    <button
                      type="button"
                      onClick={() => removerItem(index)}
                      title="Remover item"
                    >
                      <FiX />
                    </button>
                  </div>
                ))}

                {itens.length === 0 && (
                  <p className="checklists-sem-itens">
                    Nenhum item adicionado ainda.
                  </p>
                )}
              </div>
            </section>

            <div className="checklists-modal-acoes">
              <button
                type="button"
                className="checklists-cancelar"
                onClick={() => {
                  limparFormulario();
                  setModalAberto(false);
                }}
              >
                Cancelar
              </button>

              <button type="submit" className="checklists-salvar">
                {modeloEditando ? "Salvar Alterações" : "Salvar Checklist"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default Checklists;
