import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiCamera, FiCheck, FiSave } from "react-icons/fi";

import Sidebar from "../../components/Sidebar/Sidebar";
import { getUsuarioLogado } from "../../services/auth";
import {
  listarModelosChecklist,
  obterRascunhoChecklist,
  removerRascunhoChecklist,
  salvarExecucaoChecklist,
  salvarRascunhoChecklist,
  type StatusItemChecklist,
} from "../../services/checklistsLocal";

import "./ExecucaoChecklist.css";

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

  const [notificacao, setNotificacao] = useState<{
    tipo: "sucesso" | "erro" | "aviso";
    titulo: string;
    mensagem: string;
  } | null>(null);

  const modelo = useMemo(() => {
    return listarModelosChecklist().find((item) => item.id === id);
  }, [id]);

  const [itens, setItens] = useState<ItemExecucao[]>(() => {
    if (!modelo) return [];

    const rascunho = obterRascunhoChecklist(modelo.id);

    if (rascunho) {
      return rascunho.itens;
    }

    return modelo.itens.map((item, index) => ({
      id: `${modelo.id}-${index}`,
      descricao: item,
      status: "Pendente",
      observacao: "",
    }));
  });

  function alterarStatus(itemId: string, status: StatusItemChecklist) {
    setItens((estadoAtual) =>
      estadoAtual.map((item) =>
        item.id === itemId ? { ...item, status } : item
      )
    );
  }

  function alterarObservacao(itemId: string, observacao: string) {
    setItens((estadoAtual) =>
      estadoAtual.map((item) =>
        item.id === itemId ? { ...item, observacao } : item
      )
    );
  }

  function anexarFoto(itemId: string, arquivo?: File) {
    if (!arquivo) return;

    const leitor = new FileReader();

    leitor.onload = () => {
      setItens((estadoAtual) =>
        estadoAtual.map((item) =>
          item.id === itemId ? { ...item, foto: String(leitor.result) } : item
        )
      );
    };

    leitor.readAsDataURL(arquivo);
  }

  function mostrarNotificacao(
    tipo: "sucesso" | "erro" | "aviso",
    titulo: string,
    mensagem: string
  ) {
    setNotificacao({ tipo, titulo, mensagem });

    window.setTimeout(() => {
      setNotificacao(null);
    }, 3500);
  }

  function salvarRascunho() {
    if (!modelo) return;

    salvarRascunhoChecklist({
      modeloId: modelo.id,
      nomeModelo: modelo.nome,
      oficina: modelo.oficina,
      categoria: modelo.categoria,
      almoxarifeNome: usuario?.nome || "Almoxarife",
      itens,
    });

    mostrarNotificacao(
      "sucesso",
      "Rascunho salvo",
      "O preenchimento do checklist foi salvo localmente."
    );
  }

  function finalizarChecklist() {
    const possuiPendente = itens.some((item) => item.status === "Pendente");

    if (possuiPendente) {
      mostrarNotificacao(
        "aviso",
        "Checklist incompleto",
        "Marque todos os itens antes de finalizar."
      );
      return;
    }

    if (!modelo) {
      mostrarNotificacao(
        "erro",
        "Erro ao finalizar",
        "O modelo de checklist não foi encontrado."
      );
      return;
    }

    salvarExecucaoChecklist({
      modeloId: modelo.id,
      nomeModelo: modelo.nome,
      oficina: modelo.oficina,
      categoria: modelo.categoria,
      almoxarifeNome: usuario?.nome || "Almoxarife",
      itens,
    });

    removerRascunhoChecklist(modelo.id);

    mostrarNotificacao(
      "sucesso",
      "Checklist finalizado",
      "A execução foi registrada com sucesso."
    );

    window.setTimeout(() => {
      navigate("/checklists");
    }, 1200);
  }

  if (!modelo) {
    return (
      <div className="execucao-layout">
        <Sidebar />

        <main className="execucao-main">
          {notificacao && (
            <div className={`execucao-toast ${notificacao.tipo}`}>
              <strong>{notificacao.titulo}</strong>
              <span>{notificacao.mensagem}</span>
            </div>
          )}

          <section className="execucao-conteudo">
            <h1>Checklist não encontrado.</h1>

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

              <p>
                {modelo.oficina} • {modelo.categoria}
              </p>

              <span>Almoxarife: {usuario?.nome ?? "Usuário"}</span>
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
                    <th>Observação</th>
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
                                    status as StatusItemChecklist
                                  )
                                }
                              >
                                {status}
                              </button>
                            )
                          )}
                        </div>
                      </td>

                      <td>
                        <input
                          type="text"
                          placeholder="Observação..."
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

                        {item.foto && (
                          <span className="execucao-foto-ok">OK</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <footer className="execucao-rodape">
              <button
                type="button"
                className="execucao-salvar"
                onClick={salvarRascunho}
              >
                <FiSave />
                Salvar Rascunho
              </button>

              <button
                type="button"
                className="execucao-finalizar"
                onClick={finalizarChecklist}
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