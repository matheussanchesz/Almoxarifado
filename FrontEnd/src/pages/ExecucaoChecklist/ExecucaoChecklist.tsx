import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiCamera, FiCheck } from "react-icons/fi";

import Header from "../../components/Header/Header";
import Sidebar from "../../components/Sidebar/Sidebar";
import { getUsuarioLogado } from "../../services/auth";
import {
  executarChecklistApi,
  obterChecklistApi,
  type ChecklistApi,
} from "../../services/checklists";

import "./ExecucaoChecklist.css";

type StatusItemChecklist = "Pendente" | "Conforme" | "Faltante" | "Danificado";

type ItemExecucao = {
  id: string;
  descricao: string;
  status: StatusItemChecklist;
  observacao: string;
  foto?: string;
};

function ExecucaoChecklist() {
  const navigate = useNavigate();
  const { id } = useParams();
  const usuario = getUsuarioLogado();

  const [modelo, setModelo] = useState<ChecklistApi | null>(null);
  const [itens, setItens] = useState<ItemExecucao[]>([]);
  const [notificacao, setNotificacao] = useState<{
    tipo: "sucesso" | "erro" | "aviso";
    titulo: string;
    mensagem: string;
  } | null>(null);

  useEffect(() => {
    let ativo = true;

    async function carregarModelo() {
      if (!id) return;

      try {
        const dados = await obterChecklistApi(id);

        if (ativo) {
          setModelo(dados);
          setItens(
            dados.itens.map((item) => ({
              id: item.id,
              descricao: item.descricao,
              status: "Pendente",
              observacao: "",
            })),
          );
        }
      } catch {
        if (ativo) {
          setModelo(null);
        }
      }
    }

    void carregarModelo();

    return () => {
      ativo = false;
    };
  }, [id]);

  function alterarStatus(itemId: string, status: StatusItemChecklist) {
    setItens((estadoAtual) =>
      estadoAtual.map((item) =>
        item.id === itemId ? { ...item, status } : item,
      ),
    );
  }

  function alterarObservacao(itemId: string, observacao: string) {
    setItens((estadoAtual) =>
      estadoAtual.map((item) =>
        item.id === itemId ? { ...item, observacao } : item,
      ),
    );
  }

  function anexarFoto(itemId: string, arquivo?: File) {
    if (!arquivo) return;

    const leitor = new FileReader();

    leitor.onload = () => {
      setItens((estadoAtual) =>
        estadoAtual.map((item) =>
          item.id === itemId ? { ...item, foto: String(leitor.result) } : item,
        ),
      );
    };

    leitor.readAsDataURL(arquivo);
  }

  function mostrarNotificacao(
    tipo: "sucesso" | "erro" | "aviso",
    titulo: string,
    mensagem: string,
  ) {
    setNotificacao({ tipo, titulo, mensagem });

    window.setTimeout(() => {
      setNotificacao(null);
    }, 3500);
  }

  async function finalizarChecklist() {
    const possuiPendente = itens.some((item) => item.status === "Pendente");

    if (possuiPendente) {
      alert("Marque todos os itens antes de finalizar.");
      return;
    }

    if (!modelo) {
      alert("Modelo de checklist nao encontrado.");
      return;
    }

    try {
      await executarChecklistApi({
        checklistId: modelo.id,
        itens: itens.map((item) => ({
          itemId: item.id,
          status: item.status,
          observacao: item.observacao,
          fotoUrl: item.foto ?? "",
        })),
      });

      alert("Checklist finalizado com sucesso!");
      navigate("/checklists");
    } catch {
      mostrarNotificacao(
        "erro",
        "Erro ao finalizar",
        "Nao foi possivel salvar a execucao. Tente novamente.",
      );
    }
  }

  if (!modelo) {
    return (
      <div className="execucao-layout">
        <Sidebar />

        <main className="execucao-main">
          <Header titulo="Execução do Checklist" />
          <section className="execucao-conteudo">
            <h1>Checklist nao encontrado.</h1>
            <button type="button" onClick={() => navigate("/checklists")}>
              Voltar
            </button>
          </section>
        </main>
      </div>
    );
  }

  const total = itens.length;
  const conformes = itens.filter((item) => item.status === "Conforme").length;
  const faltantes = itens.filter((item) => item.status === "Faltante").length;
  const danificados = itens.filter((item) => item.status === "Danificado").length;

  return (
    <div className="execucao-layout">
      <Sidebar />

      <main className="execucao-main">
        <Header titulo="Execução do Checklist" />
        {notificacao && (
          <div className={`execucao-toast ${notificacao.tipo}`}>
            <strong>{notificacao.titulo}</strong>
            <span>{notificacao.mensagem}</span>
          </div>
        )}

        <section className="execucao-conteudo">
          <header className="execucao-cabecalho">
            <button
              type="button"
              className="execucao-voltar"
              onClick={() => navigate("/checklists")}
            >
              <FiArrowLeft />
              Voltar
            </button>

            <div className="execucao-titulo">
              <h1>{modelo.nome}</h1>
              <p>{modelo.oficina}</p>
              <span>Almoxarife: {usuario?.nome ?? "Usuario"}</span>
            </div>
          </header>

          <div className="execucao-resumo">
            <div>
              <strong>{total}</strong>
              <span>Total</span>
            </div>

            <div>
              <strong>{conformes}</strong>
              <span>Conformes</span>
            </div>

            <div>
              <strong>{faltantes}</strong>
              <span>Faltantes</span>
            </div>

            <div>
              <strong>{danificados}</strong>
              <span>Danificados</span>
            </div>
          </div>

          <div className="execucao-card">
            <div className="execucao-tabela-wrapper">
              <table className="execucao-tabela">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>Status</th>
                    <th>Observacao</th>
                    <th>Foto</th>
                  </tr>
                </thead>

                <tbody>
                  {itens.map((item) => (
                    <tr key={item.id}>
                      <td>{item.descricao}</td>

                      <td>
                        <div className="execucao-status-opcoes">
                          {["Conforme", "Faltante", "Danificado"].map(
                            (status) => (
                              <button
                                key={status}
                                type="button"
                                className={
                                  item.status === status
                                    ? `ativo ${status.toLowerCase()}`
                                    : ""
                                }
                                onClick={() =>
                                  alterarStatus(
                                    item.id,
                                    status as StatusItemChecklist,
                                  )
                                }
                              >
                                {status}
                              </button>
                            ),
                          )}
                        </div>
                      </td>

                      <td>
                        <input
                          type="text"
                          placeholder="Observacao..."
                          value={item.observacao}
                          onChange={(e) =>
                            alterarObservacao(item.id, e.target.value)
                          }
                        />
                      </td>

                      <td>
                        <label className="execucao-foto">
                          <FiCamera />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) =>
                              anexarFoto(item.id, e.target.files?.[0])
                            }
                          />
                        </label>

                        {item.foto && <span className="execucao-foto-ok">OK</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <footer className="execucao-rodape">
              <button
                type="button"
                className="execucao-finalizar"
                onClick={() => void finalizarChecklist()}
              >
                <FiCheck />
                Finalizar Checklist
              </button>
            </footer>
          </div>
        </section>
      </main>
    </div>
  );
}

export default ExecucaoChecklist;
