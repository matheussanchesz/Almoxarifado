import { useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiClock, FiMail, FiPrinter } from "react-icons/fi";

import Sidebar from "../../components/Sidebar/Sidebar";
import Header from "../../components/Header/Header";

import "./DetalhesCompra.css";

type StatusCompra =
  | "Aguardando Processamento"
  | "Em Cotação"
  | "Pedido Realizado"
  | "Recebido"
  | "Cancelado";

type CompraDetalhe = {
  id: string;
  data: string;
  item: string;
  especificacao: string;
  categoria: "Insumo" | "Ferramenta" | "Peça de Reposição";
  quantidade: number;
  urgencia: "Baixa" | "Média" | "Alta";
  status: StatusCompra;
  solicitante: string;
  justificativa: string;
};

const comprasMock: CompraDetalhe[] = [
  {
    id: "COMP-001",
    data: "2026-07-01",
    item: "Torquímetro Digital",
    especificacao: "Ferramenta de precisão para aperto controlado.",
    categoria: "Ferramenta",
    quantidade: 2,
    urgencia: "Alta",
    status: "Aguardando Processamento",
    solicitante: "Almoxarife Teste",
    justificativa:
      "Ferramentas atuais estão danificadas e comprometem a realização das aulas práticas de motores.",
  },
  {
    id: "COMP-002",
    data: "2026-07-02",
    item: "Óleo lubrificante 5W30",
    especificacao: "Insumo para atividades práticas de manutenção preventiva.",
    categoria: "Insumo",
    quantidade: 4,
    urgencia: "Média",
    status: "Em Cotação",
    solicitante: "Almoxarife Teste",
    justificativa:
      "Reposição necessária para manter o fluxo de aulas práticas de revisão automotiva.",
  },
];

function formatarData(data: string) {
  return new Date(data).toLocaleDateString("pt-BR");
}

function DetalhesCompra() {
  const navigate = useNavigate();
  const { id } = useParams();

  const compra = comprasMock.find((item) => item.id === id);

  if (!compra) {
    return (
      <div className="detalhes-compra-layout">
        <Sidebar />

        <main className="detalhes-compra-main">
          <Header titulo="Detalhes da Compra" />

          <section className="detalhes-compra-conteudo">
            <button
              type="button"
              className="detalhes-compra-voltar"
              onClick={() => navigate("/compras")}
            >
              <FiArrowLeft />
              Voltar
            </button>

            <h1>Solicitação não encontrada</h1>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="detalhes-compra-layout">
      <Sidebar />

      <main className="detalhes-compra-main">
        <Header titulo="Detalhes da Compra" />

        <section className="detalhes-compra-conteudo">
          <header className="detalhes-compra-cabecalho">
            <button
              type="button"
              className="detalhes-compra-voltar"
              onClick={() => navigate("/compras")}
            >
              <FiArrowLeft />
              Voltar
            </button>

            <div className="detalhes-compra-titulo">
              <div>
                <span className="detalhes-compra-codigo">{compra.id}</span>
                <h1>{compra.item}</h1>
                <p>
                  {compra.categoria} • {compra.quantidade} un. •{" "}
                  {formatarData(compra.data)}
                </p>
              </div>

              <div className="detalhes-compra-acoes">
                <button type="button" onClick={() => window.print()}>
                  <FiPrinter />
                  Imprimir
                </button>

                <button type="button">
                  <FiMail />
                  Enviar e-mail
                </button>
              </div>
            </div>
          </header>

          <section className="detalhes-compra-resumo">
            <div>
              <span>Status</span>
              <strong>{compra.status}</strong>
            </div>

            <div>
              <span>Urgência</span>
              <strong>{compra.urgencia}</strong>
            </div>

            <div>
              <span>Solicitante</span>
              <strong>{compra.solicitante}</strong>
            </div>

            <div>
              <span>Data da solicitação</span>
              <strong>{formatarData(compra.data)}</strong>
            </div>
          </section>

          <section className="detalhes-compra-grid">
            <article className="detalhes-compra-card">
              <h2>Dados da Solicitação</h2>

              <div className="detalhes-compra-info">
                <span>Categoria</span>
                <strong>{compra.categoria}</strong>
              </div>

              <div className="detalhes-compra-info">
                <span>Item</span>
                <strong>{compra.item}</strong>
              </div>

              <div className="detalhes-compra-info">
                <span>Quantidade</span>
                <strong>{compra.quantidade} unidades</strong>
              </div>

              <div className="detalhes-compra-info">
                <span>Especificação Técnica</span>
                <p>{compra.especificacao}</p>
              </div>

              <div className="detalhes-compra-info">
                <span>Justificativa Operacional</span>
                <p>{compra.justificativa}</p>
              </div>
            </article>

            <aside className="detalhes-compra-card">
              <h2>Histórico</h2>

              <div className="detalhes-compra-timeline">
                <div>
                  <FiClock />
                  <section>
                    <strong>Solicitação criada</strong>
                    <span>{formatarData(compra.data)}</span>
                  </section>
                </div>

                <div>
                  <FiClock />
                  <section>
                    <strong>Status atual</strong>
                    <span>{compra.status}</span>
                  </section>
                </div>

                <div>
                  <FiMail />
                  <section>
                    <strong>E-mail institucional</strong>
                    <span>Aguardando integração com backend</span>
                  </section>
                </div>
              </div>
            </aside>
          </section>
        </section>
      </main>
    </div>
  );
}

export default DetalhesCompra;