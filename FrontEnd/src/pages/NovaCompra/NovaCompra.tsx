import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiSave } from "react-icons/fi";

import Sidebar from "../../components/Sidebar/Sidebar";
import Header from "../../components/Header/Header";
import { criarCompraApi } from "../../services/compras";

import "./NovaCompra.css";

function NovaCompra() {
  const navigate = useNavigate();

  const [categoria, setCategoria] = useState("");
  const [nomeItem, setNomeItem] = useState("");
  const [especificacao, setEspecificacao] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [urgencia, setUrgencia] = useState("");
  const [justificativa, setJustificativa] = useState("");

  const [abrirModal, setAbrirModal] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const [toast, setToast] = useState<{
    tipo: "sucesso" | "erro";
    mensagem: string;
  } | null>(null);

  function abrirConfirmacao(evento: React.FormEvent) {
    evento.preventDefault();
    setAbrirModal(true);
  }

  async function confirmarEnvio() {
    const dados = {
      categoria,
      nomeItem,
      especificacao,
      quantidade: Number(quantidade),
      urgencia,
      justificativa,
    };

    setSalvando(true);

    try {
      await criarCompraApi(dados);

      setToast({
        tipo: "sucesso",
        mensagem: "Solicitação enviada com sucesso.",
      });

      setAbrirModal(false);

      setTimeout(() => {
        navigate("/compras");
      }, 1200);
    } catch {
      setToast({
        tipo: "erro",
        mensagem: "Não foi possível enviar a solicitação. Tente novamente.",
      });
    } finally {
      setSalvando(false);
    }
  }
  return (
    <div className="nova-compra-layout">
      <Sidebar />

      <main className="nova-compra-main">
        <Header titulo="Nova Solicitação de Compra" />
        {toast && <div className={`toast ${toast.tipo}`}>{toast.mensagem}</div>}

        <section className="nova-compra-conteudo">
          <header className="nova-compra-cabecalho">
            <button
              type="button"
              className="nova-compra-voltar"
              onClick={() => navigate("/compras")}
            >
              <FiArrowLeft />
              Voltar
            </button>
            <p>
              Registre a necessidade de insumos, ferramentas ou peças de
              reposição para as oficinas do SENAI Automotivo.
            </p>
          </header>

          <form className="nova-compra-formulario" onSubmit={abrirConfirmacao}>
            <section className="nova-compra-card">
              <h2>Dados da Solicitação</h2>

              <div className="nova-compra-grid">
                <label>
                  Categoria <span>*</span>
                  <select
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                    required
                  >
                    <option value="">Selecione</option>
                    <option value="Insumo">Insumo</option>
                    <option value="Ferramenta">Ferramenta</option>
                    <option value="Peça de Reposição">Peça de Reposição</option>
                  </select>
                </label>

                <label>
                  Nome do Item <span>*</span>
                  <input
                    type="text"
                    placeholder="Ex.: Torquímetro Digital"
                    value={nomeItem}
                    onChange={(e) => setNomeItem(e.target.value)}
                    required
                  />
                </label>

                <label>
                  Quantidade <span>*</span>
                  <input
                    type="number"
                    min="1"
                    placeholder="Ex.: 2"
                    value={quantidade}
                    onChange={(e) => setQuantidade(e.target.value)}
                    required
                  />
                </label>

                <label>
                  Urgência <span>*</span>
                  <select
                    value={urgencia}
                    onChange={(e) => setUrgencia(e.target.value)}
                    required
                  >
                    <option value="">Selecione</option>
                    <option value="Baixa">Baixa</option>
                    <option value="Média">Média</option>
                    <option value="Alta">Alta</option>
                  </select>
                </label>
              </div>

              <label>
                Especificação Técnica <span>*</span>
                <textarea
                  placeholder="Informe modelo, medida, aplicação, marca de referência ou característica técnica."
                  value={especificacao}
                  onChange={(e) => setEspecificacao(e.target.value)}
                  required
                />
              </label>

              <label>
                Justificativa Operacional <span>*</span>
                <textarea
                  placeholder="Explique por que o item é necessário para as aulas práticas ou para a operação da oficina."
                  value={justificativa}
                  onChange={(e) => setJustificativa(e.target.value)}
                  required
                />
              </label>
            </section>

            <aside className="nova-compra-resumo">
              <h2>Resumo</h2>

              <div>
                <span>Categoria</span>
                <strong>{categoria || "—"}</strong>
              </div>

              <div>
                <span>Item</span>
                <strong>{nomeItem || "—"}</strong>
              </div>

              <div>
                <span>Quantidade</span>
                <strong>{quantidade || "—"}</strong>
              </div>

              <div>
                <span>Urgência</span>
                <strong>{urgencia || "—"}</strong>
              </div>
            </aside>

            <div className="nova-compra-acoes">
              <button
                type="button"
                className="nova-compra-cancelar"
                onClick={() => navigate("/compras")}
              >
                Cancelar
              </button>

              <button type="submit" className="nova-compra-salvar">
                <FiSave />
                Salvar Solicitação
              </button>
            </div>
          </form>
        </section>

        {abrirModal && (
          <div className="modal-overlay">
            <div className="modal-confirmacao">
              <h2>Confirmar envio</h2>

              <p>Deseja enviar esta solicitação de compra?</p>

              <ul>
                <li>
                  <strong>Item:</strong> {nomeItem}
                </li>
                <li>
                  <strong>Categoria:</strong> {categoria}
                </li>
                <li>
                  <strong>Quantidade:</strong> {quantidade}
                </li>
                <li>
                  <strong>Urgência:</strong> {urgencia}
                </li>
              </ul>

              <div className="modal-botoes">
                <button onClick={() => setAbrirModal(false)}>Cancelar</button>

                <button onClick={confirmarEnvio} disabled={salvando}>
                  {salvando ? "Enviando..." : "Confirmar envio"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default NovaCompra;
