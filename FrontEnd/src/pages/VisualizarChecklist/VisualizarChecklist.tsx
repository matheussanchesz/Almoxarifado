import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiCamera, FiPrinter, FiX } from "react-icons/fi";

import Sidebar from "../../components/Sidebar/Sidebar";
import {
  listarExecucoesChecklistApi,
  obterChecklistApi,
  type ChecklistApi,
  type ExecucaoChecklistApi,
} from "../../services/checklists";

import "./VisualizarChecklist.css";

function formatarData(data: string) {
  return new Date(data).toLocaleString("pt-BR");
}

function VisualizarChecklist() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [fotoAberta, setFotoAberta] = useState<string | null>(null);
  const [execucao, setExecucao] = useState<ExecucaoChecklistApi | null>(null);
  const [modelo, setModelo] = useState<ChecklistApi | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;

    async function carregarExecucao() {
      if (!id) {
        setCarregando(false);
        return;
      }

      try {
        const execucoes = await listarExecucoesChecklistApi();
        const execucaoEncontrada =
          execucoes.find((item) => item.id === id) ?? null;

        if (!ativo) return;

        setExecucao(execucaoEncontrada);
        setErro("");

        if (execucaoEncontrada) {
          const checklist = await obterChecklistApi(execucaoEncontrada.checklistId);

          if (ativo) {
            setModelo(checklist);
          }
        }
      } catch {
        if (ativo) {
          setErro("Nao foi possivel carregar a execucao no momento.");
        }
      } finally {
        if (ativo) {
          setCarregando(false);
        }
      }
    }

    void carregarExecucao();

    return () => {
      ativo = false;
    };
  }, [id]);

  if (carregando || !execucao) {
    return (
      <div className="visualizar-layout">
        <Sidebar />

        <main className="visualizar-main">
          <section className="visualizar-conteudo">
            <button
              type="button"
              className="visualizar-voltar"
              onClick={() => navigate("/checklists/historico")}
            >
              <FiArrowLeft />
              Voltar
            </button>

            <h1>
              {carregando ? "Carregando execução..." : "Execução não encontrada"}
            </h1>
            {erro && <p style={{ color: "#b91c1c", marginTop: 12 }}>{erro}</p>}
          </section>
        </main>
      </div>
    );
  }

  const conformes = execucao.itens.filter((i) => i.status === "Conforme").length;
  const faltantes = execucao.itens.filter((i) => i.status === "Faltante").length;
  const danificados = execucao.itens.filter(
    (i) => i.status === "Danificado",
  ).length;

  return (
    <div className="visualizar-layout">
      <Sidebar />

      <main className="visualizar-main">
        <section className="visualizar-conteudo">
          <header className="visualizar-cabecalho">
            <button
              type="button"
              className="visualizar-voltar"
              onClick={() => navigate("/checklists/historico")}
            >
              <FiArrowLeft />
              Voltar
            </button>

            <div className="visualizar-cabecalho-linha">
              <div>
                <h1>{modelo?.nome ?? execucao.checklistId}</h1>

                <p>
                  {modelo?.oficina ?? "Checklist"} -{" "}
                  {formatarData(execucao.dataExecucao)}
                </p>
              </div>

              <button
                type="button"
                className="visualizar-imprimir"
                onClick={() => window.print()}
              >
                <FiPrinter />
                Exportar / Imprimir
              </button>
            </div>
          </header>

          <div className="visualizar-resumo">
            <div>
              <strong>{execucao.itens.length}</strong>
              <span>Total</span>
            </div>

            <div className="ok">
              <strong>{conformes}</strong>
              <span>Conformes</span>
            </div>

            <div className="alerta">
              <strong>{faltantes}</strong>
              <span>Faltantes</span>
            </div>

            <div className="critico">
              <strong>{danificados}</strong>
              <span>Danificados</span>
            </div>
          </div>

          <div className="visualizar-info">
            <strong>Executado por:</strong>
            <span>{execucao.almoxarifeNome}</span>
          </div>

          <div className="visualizar-card">
            {execucao.itens.map((item) => (
              <article
                className={`visualizar-item ${item.status.toLowerCase()}`}
                key={item.itemId}
              >
                <div>
                  <h2>{item.descricao}</h2>
                  <p>{item.observacao || "Sem observacao registrada."}</p>
                </div>

                <div className="visualizar-item-acoes">
                  <span
                    className={`visualizar-status ${item.status.toLowerCase()}`}
                  >
                    {item.status}
                  </span>

                  {item.fotoUrl && (
                    <button
                      type="button"
                      className="visualizar-thumb"
                      onClick={() => setFotoAberta(item.fotoUrl || null)}
                    >
                      <img src={item.fotoUrl} alt="Foto do checklist" />
                      <span>
                        <FiCamera />
                      </span>
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>

        {fotoAberta && (
          <div className="visualizar-modal-foto">
            <button
              type="button"
              className="visualizar-fechar-foto"
              onClick={() => setFotoAberta(null)}
            >
              <FiX />
            </button>

            <img src={fotoAberta} alt="Foto ampliada do checklist" />
          </div>
        )}
      </main>
    </div>
  );
}

export default VisualizarChecklist;
