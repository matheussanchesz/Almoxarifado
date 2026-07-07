import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FiArrowLeft, FiClock, FiMail, FiPrinter } from "react-icons/fi";

import Header from "../../components/Header/Header";
import Sidebar from "../../components/Sidebar/Sidebar";
import {
  obterCompraApi,
  type SolicitacaoCompra,
} from "../../services/compras";

import "./DetalhesCompra.css";

function formatarData(data: string) {
  return new Date(data).toLocaleDateString("pt-BR");
}

function DetalhesCompra() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [compra, setCompra] = useState<SolicitacaoCompra | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;

    async function carregarCompra() {
      if (!id) return;

      try {
        const dados = await obterCompraApi(id);

        if (ativo) {
          setCompra(dados);
          setErro("");
        }
      } catch {
        if (ativo) {
          setErro("Solicitacao nao encontrada ou indisponivel na API.");
        }
      } finally {
        if (ativo) {
          setCarregando(false);
        }
      }
    }

    void carregarCompra();

    return () => {
      ativo = false;
    };
  }, [id]);

  if (carregando || !compra) {
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

            <h1>{carregando ? "Carregando solicitacao..." : erro}</h1>
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
                <h1>{compra.nomeItem}</h1>
                <p>
                  {compra.categoria} - {compra.quantidade} un. -{" "}
                  {formatarData(compra.dataSolicitacao)}
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
              <span>Urgencia</span>
              <strong>{compra.urgencia}</strong>
            </div>

            <div>
              <span>Solicitante</span>
              <strong>{compra.almoxarifeNome}</strong>
            </div>

            <div>
              <span>Data da solicitacao</span>
              <strong>{formatarData(compra.dataSolicitacao)}</strong>
            </div>
          </section>

          <section className="detalhes-compra-grid">
            <article className="detalhes-compra-card">
              <h2>Dados da Solicitacao</h2>

              <div className="detalhes-compra-info">
                <span>Categoria</span>
                <strong>{compra.categoria}</strong>
              </div>

              <div className="detalhes-compra-info">
                <span>Item</span>
                <strong>{compra.nomeItem}</strong>
              </div>

              <div className="detalhes-compra-info">
                <span>Quantidade</span>
                <strong>{compra.quantidade} unidades</strong>
              </div>

              <div className="detalhes-compra-info">
                <span>Especificacao tecnica</span>
                <p>{compra.especificacao}</p>
              </div>

              <div className="detalhes-compra-info">
                <span>Justificativa operacional</span>
                <p>{compra.justificativa}</p>
              </div>
            </article>

            <aside className="detalhes-compra-card">
              <h2>Historico</h2>

              <div className="detalhes-compra-timeline">
                <div>
                  <FiClock />
                  <section>
                    <strong>Solicitacao criada</strong>
                    <span>{formatarData(compra.dataSolicitacao)}</span>
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
                    <span>Aguardando integracao com backend</span>
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
