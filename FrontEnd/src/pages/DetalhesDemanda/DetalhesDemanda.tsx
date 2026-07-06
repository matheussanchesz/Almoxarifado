import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiClock,
  FiFileText,
  FiImage,
  FiPrinter,
} from "react-icons/fi";

import Header from "../../components/Header/Header";
import Sidebar from "../../components/Sidebar/Sidebar";
import { listarDemandasLocais } from "../../services/localData";

import "./DetalhesDemanda.css";

function formatarData(data: string) {
  return new Date(data).toLocaleString("pt-BR");
}

function DetalhesDemanda() {
  const navigate = useNavigate();
  const { id } = useParams();

  const demanda = useMemo(() => {
    return listarDemandasLocais().find((item) => item.id === id);
  }, [id]);

  if (!demanda) {
    return (
      <div className="detalhes-demanda-layout">
        <Sidebar />

        <main className="detalhes-demanda-main">
          <Header titulo="Detalhes da Demanda" />

          <section className="detalhes-demanda-conteudo">
            <button
              type="button"
              className="detalhes-demanda-voltar"
              onClick={() => navigate("/demandas")}
            >
              <FiArrowLeft />
              Voltar
            </button>

            <h1>Demanda não encontrada</h1>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="detalhes-demanda-layout">
      <Sidebar />

      <main className="detalhes-demanda-main">
        <Header titulo="Detalhes da Demanda" />

        <section className="detalhes-demanda-conteudo">
          <header className="detalhes-demanda-cabecalho">
            <button
              type="button"
              className="detalhes-demanda-voltar"
              onClick={() => navigate("/demandas")}
            >
              <FiArrowLeft />
              Voltar
            </button>

            <div className="detalhes-demanda-topo">
              <div>
                <span className="detalhes-demanda-id">#{demanda.id}</span>
                <h1>{demanda.titulo}</h1>
                <p>{demanda.oficina}</p>
              </div>

              <button
                type="button"
                className="detalhes-demanda-imprimir"
                onClick={() => window.print()}
              >
                <FiPrinter />
                Imprimir
              </button>
            </div>
          </header>

          <section className="detalhes-demanda-resumo">
            <div>
              <span>Status</span>
              <strong>{demanda.status}</strong>
            </div>

            <div>
              <span>Prioridade</span>
              <strong>{demanda.prioridade}</strong>
            </div>

            <div>
              <span>Professor</span>
              <strong>{demanda.professorNome}</strong>
            </div>

            <div>
              <span>Prazo operacional</span>
              <strong>{formatarData(demanda.dataHoraNecessaria)}</strong>
            </div>
          </section>

          <section className="detalhes-demanda-grid">
            <article className="detalhes-demanda-card">
              <h2>
                <FiFileText />
                Dados da Solicitação
              </h2>

              <div className="detalhes-demanda-info">
                <span>Oficina / Laboratório</span>
                <strong>{demanda.oficina}</strong>
              </div>

              <div className="detalhes-demanda-info">
                <span>Professor</span>
                <strong>{demanda.professorNome}</strong>
              </div>

              <div className="detalhes-demanda-info">
                <span>Matrícula</span>
                <strong>{demanda.professorMatricula}</strong>
              </div>

              <div className="detalhes-demanda-info">
                <span>Data de criação</span>
                <strong>{formatarData(demanda.dataHoraCriacao)}</strong>
              </div>
            </article>

            <article className="detalhes-demanda-card">
              <h2>
                <FiFileText />
                Descrição / Recursos necessários
              </h2>

              <p className="detalhes-demanda-descricao">
                {demanda.descricao || "Nenhuma descrição informada."}
              </p>
            </article>

            <article className="detalhes-demanda-card">
              <h2>
                <FiImage />
                Anexos
              </h2>

              <div className="detalhes-demanda-anexos-vazio">
                Nenhum anexo disponível nesta visualização.
              </div>
            </article>

            <aside className="detalhes-demanda-card detalhes-demanda-timeline">
              <h2>
                <FiClock />
                Histórico
              </h2>

              <div className="detalhes-demanda-evento">
                <span />
                <div>
                  <strong>Demanda criada</strong>
                  <p>{formatarData(demanda.dataHoraCriacao)}</p>
                </div>
              </div>

              <div className="detalhes-demanda-evento">
                <span />
                <div>
                  <strong>Status atual</strong>
                  <p>{demanda.status}</p>
                </div>
              </div>
            </aside>
          </section>
        </section>
      </main>
    </div>
  );
}

export default DetalhesDemanda;