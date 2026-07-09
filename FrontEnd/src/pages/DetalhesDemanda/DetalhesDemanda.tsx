import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  FiArrowLeft,
  FiClock,
  FiDownload,
  FiFileText,
  FiImage,
  FiPrinter,
} from "react-icons/fi";

import Header from "../../components/Header/Header";
import Sidebar from "../../components/Sidebar/Sidebar";
import {
  baixarAnexoApi,
  listarAnexosDemandaApi,
  type AnexoApi,
} from "../../services/anexos";
import { obterDemandaApi, type DemandaApi } from "../../services/demandas";

import "./DetalhesDemanda.css";

function formatarData(data: string) {
  return new Date(data).toLocaleString("pt-BR");
}

function DetalhesDemanda() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [demanda, setDemanda] = useState<DemandaApi | null>(null);
  const [anexos, setAnexos] = useState<AnexoApi[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [erroAnexos, setErroAnexos] = useState("");

  useEffect(() => {
    let ativo = true;

    async function carregarDemanda() {
      if (!id) return;

      try {
        const dados = await obterDemandaApi(id);
        const anexosDemanda = await listarAnexosDemandaApi(id);

        if (ativo) {
          setDemanda(dados);
          setAnexos(anexosDemanda);
          setErro("");
          setErroAnexos("");
        }
      } catch {
        if (ativo) {
          setErro("Demanda nao encontrada ou indisponivel no momento.");
        }
      } finally {
        if (ativo) {
          setCarregando(false);
        }
      }
    }

    void carregarDemanda();

    return () => {
      ativo = false;
    };
  }, [id]);

  if (carregando || !demanda) {
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

            <h1>{carregando ? "Carregando demanda..." : erro}</h1>
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
                Dados da Solicitacao
              </h2>

              <div className="detalhes-demanda-info">
                <span>Oficina / Laboratorio</span>
                <strong>{demanda.oficina}</strong>
              </div>

              <div className="detalhes-demanda-info">
                <span>Professor</span>
                <strong>{demanda.professorNome}</strong>
              </div>

              <div className="detalhes-demanda-info">
                <span>Matricula</span>
                <strong>{demanda.professorMatricula}</strong>
              </div>

              <div className="detalhes-demanda-info">
                <span>Data de criacao</span>
                <strong>{formatarData(demanda.dataHoraCriacao)}</strong>
              </div>
            </article>

            <article className="detalhes-demanda-card">
              <h2>
                <FiFileText />
                Descricao / Recursos necessarios
              </h2>

              <p className="detalhes-demanda-descricao">
                {demanda.descricao || "Nenhuma descricao informada."}
              </p>
            </article>

            <article className="detalhes-demanda-card">
              <h2>
                <FiImage />
                Anexos
              </h2>

              {erroAnexos && (
                <div className="detalhes-demanda-anexos-vazio">{erroAnexos}</div>
              )}

              {!erroAnexos && anexos.length === 0 && (
                <div className="detalhes-demanda-anexos-vazio">
                  Nenhum anexo disponivel nesta visualizacao.
                </div>
              )}

              {!erroAnexos && anexos.length > 0 && (
                <div className="detalhes-demanda-anexos-lista">
                  {anexos.map((anexo) => (
                    <button
                      type="button"
                      key={anexo.id}
                      className="detalhes-demanda-anexo"
                      onClick={async () => {
                        try {
                          await baixarAnexoApi(anexo);
                        } catch {
                          setErroAnexos("Nao foi possivel baixar o anexo.");
                        }
                      }}
                    >
                      <FiDownload />
                      <span>
                        <strong>{anexo.nomeArquivo}</strong>
                        <small>
                          {anexo.tipo} - {Math.max(1, anexo.tamanho)} KB
                        </small>
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </article>

            <aside className="detalhes-demanda-card detalhes-demanda-timeline">
              <h2>
                <FiClock />
                Historico
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
