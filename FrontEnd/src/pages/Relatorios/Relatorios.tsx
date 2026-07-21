import { useEffect, useMemo, useState } from "react";
import {
  FiAlertTriangle,
  FiBarChart2,
  FiCheckCircle,
  FiClock,
  FiDownload,
  FiFileText,
  FiFilter,
  FiPieChart,
  FiPrinter,
} from "react-icons/fi";

import Header from "../../components/Header/Header";
import Sidebar from "../../components/Sidebar/Sidebar";
import { listarDemandasApi, type DemandaApi } from "../../services/demandas";

import "./Relatorios.css";

type PeriodoRelatorio = "7 dias" | "30 dias" | "90 dias" | "Todos";

function formatarData(data: string) {
  return new Date(data).toLocaleDateString("pt-BR");
}

function normalizarStatus(status: string) {
  return status
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function baixarArquivo(conteudo: string, nomeArquivo: string, tipo: string) {
  const arquivo = new Blob([conteudo], { type: tipo });
  const url = URL.createObjectURL(arquivo);
  const link = document.createElement("a");

  link.href = url;
  link.download = nomeArquivo;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

function valorCsv(valor: string | number) {
  return `"${String(valor).replace(/"/g, '""')}"`;
}

function Relatorios() {
  const [periodo, setPeriodo] = useState<PeriodoRelatorio>("30 dias");
  const [demandas, setDemandas] = useState<DemandaApi[]>([]);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;

    async function carregarDemandas() {
      try {
        const dados = await listarDemandasApi();

        if (ativo) {
          setDemandas(dados);
          setErro("");
        }
      } catch {
        if (ativo) {
      setErro("Não foi possível carregar os relatórios no momento.");
        }
      }
    }

    void carregarDemandas();

    return () => {
      ativo = false;
    };
  }, []);

  const demandasFiltradas = useMemo(() => {
    if (periodo === "Todos") return demandas;

    const dias = periodo === "7 dias" ? 7 : periodo === "30 dias" ? 30 : 90;

    const limite = new Date();
    limite.setDate(limite.getDate() - dias);

    return demandas.filter(
      (demanda) => new Date(demanda.dataHoraCriacao) >= limite,
    );
  }, [demandas, periodo]);

  const totalDemandas = demandasFiltradas.length;

  const abertas = demandasFiltradas.filter(
    (demanda) => normalizarStatus(demanda.status) === "aberta",
  ).length;

  const emAndamento = demandasFiltradas.filter(
    (demanda) => normalizarStatus(demanda.status) === "em andamento",
  ).length;

  const concluidas = demandasFiltradas.filter(
    (demanda) => normalizarStatus(demanda.status) === "concluida",
  ).length;

  const urgentes = demandasFiltradas.filter(
    (demanda) => demanda.prioridade === "Urgente",
  ).length;

  const atrasadas = demandasFiltradas.filter((demanda) => {
    const prazo = new Date(demanda.dataHoraNecessaria).getTime();
    const agora = new Date().getTime();

    return prazo < agora && normalizarStatus(demanda.status) !== "concluida";
  }).length;

  const taxaConclusao =
    totalDemandas === 0 ? 0 : Math.round((concluidas / totalDemandas) * 100);

  const demandasPorOficina = useMemo(() => {
    const mapa = new Map<string, number>();

    demandasFiltradas.forEach((demanda) => {
      mapa.set(demanda.oficina, (mapa.get(demanda.oficina) || 0) + 1);
    });

    return Array.from(mapa.entries())
      .map(([oficina, quantidade]) => ({ oficina, quantidade }))
      .sort((a, b) => b.quantidade - a.quantidade);
  }, [demandasFiltradas]);

  const demandasPorPrioridade = useMemo(() => {
    const prioridades = ["Urgente", "Alta", "Normal", "Baixa"];

    return prioridades.map((prioridade) => ({
      prioridade,
      quantidade: demandasFiltradas.filter(
        (demanda) => demanda.prioridade === prioridade,
      ).length,
    }));
  }, [demandasFiltradas]);

  function exportarCsv() {
    const resumo = [
      ["Período", periodo],
      ["Gerado em", new Date().toLocaleString("pt-BR")],
      ["Total de demandas", totalDemandas],
      ["Abertas", abertas],
      ["Em andamento", emAndamento],
      ["Concluídas", concluidas],
      ["Urgentes", urgentes],
      ["Atrasadas", atrasadas],
      ["Taxa de conclusao", `${taxaConclusao}%`],
    ].map((linha) => linha.map(valorCsv).join(";"));

    const demandasCsv = [
      [
        "ID",
      "Título",
        "Solicitante",
        "Oficina",
        "Status",
        "Prioridade",
        "Prazo",
      "Criação",
      ],
      ...demandasFiltradas.map((demanda) => [
        demanda.id,
        demanda.titulo,
        demanda.professorNome,
        demanda.oficina,
        demanda.status,
        demanda.prioridade,
        formatarData(demanda.dataHoraNecessaria),
        formatarData(demanda.dataHoraCriacao),
      ]),
    ].map((linha) => linha.map(valorCsv).join(";"));

    baixarArquivo(
      `\uFEFF${[...resumo, "", ...demandasCsv].join("\r\n")}`,
      `relatorio-demandas-${new Date().toISOString().slice(0, 10)}.csv`,
      "text/csv;charset=utf-8",
    );
  }

  return (
    <div className="relatorios-layout">
      <Sidebar />

      <main className="relatorios-main">
        <Header titulo="Relatórios" />

        <section className="relatorios-conteudo">
          <header className="relatorios-cabecalho">
            <div>
              <h1 className="relatorios-titulo-impressao">
                Relatório Gerencial de Demandas
              </h1>
              <p>
                Acompanhe indicadores operacionais, prioridades, atrasos e
                desempenho do almoxarifado.
              </p>
            </div>

            <div className="relatorios-acoes">
              <label>
                <FiFilter />
                <select
                  value={periodo}
                  onChange={(evento) =>
                    setPeriodo(evento.target.value as PeriodoRelatorio)
                  }
                >
                  <option value="7 dias">Últimos 7 dias</option>
                  <option value="30 dias">Últimos 30 dias</option>
                  <option value="90 dias">Últimos 90 dias</option>
                  <option value="Todos">Todos</option>
                </select>
              </label>

              <button
                type="button"
                className="relatorios-exportar-csv"
                onClick={exportarCsv}
                title="Baixar os dados filtrados em CSV"
              >
                <FiDownload />
                Exportar CSV
              </button>

              <button
                type="button"
                className="relatorios-imprimir"
                onClick={() => window.print()}
                title="Abrir a visualização de impressão"
              >
                <FiPrinter />
                Imprimir relatório
              </button>
            </div>
          </header>

          {erro && <p style={{ color: "#b91c1c", marginBottom: 12 }}>{erro}</p>}

          <section className="relatorios-indicadores">
            <article>
              <FiFileText />
              <div>
                <strong>{totalDemandas}</strong>
                <span>Total de demandas</span>
              </div>
            </article>

            <article className="andamento">
              <FiClock />
              <div>
                <strong>{emAndamento}</strong>
                <span>Em andamento</span>
              </div>
            </article>

            <article className="concluidas">
              <FiCheckCircle />
              <div>
                <strong>{concluidas}</strong>
                <span>Concluídas</span>
              </div>
            </article>

            <article className="atrasadas">
              <FiAlertTriangle />
              <div>
                <strong>{atrasadas}</strong>
                <span>Atrasadas</span>
              </div>
            </article>
          </section>

          <section className="relatorios-grid">
            <article className="relatorios-card">
              <div className="relatorios-card-topo">
                <div>
                  <h2>Demandas por oficina</h2>
                  <p>Distribuição das solicitações por ambiente.</p>
                </div>

                <FiBarChart2 />
              </div>

              <div className="relatorios-barras">
                {demandasPorOficina.map((item) => {
                  const percentual =
                    totalDemandas === 0
                      ? 0
                      : Math.round((item.quantidade / totalDemandas) * 100);

                  return (
                    <div key={item.oficina} className="relatorios-barra-item">
                      <div>
                        <strong>{item.oficina}</strong>
                        <span>{item.quantidade} demanda(s)</span>
                      </div>

                      <div className="relatorios-barra">
                        <span style={{ width: `${percentual}%` }} />
                      </div>

                      <small>{percentual}%</small>
                    </div>
                  );
                })}

                {demandasPorOficina.length === 0 && (
                  <div className="relatorios-vazio">
                    Nenhuma demanda encontrada no período.
                  </div>
                )}
              </div>
            </article>

            <article className="relatorios-card">
              <div className="relatorios-card-topo">
                <div>
                  <h2>Prioridades</h2>
                  <p>Volume de demandas por criticidade.</p>
                </div>

                <FiPieChart />
              </div>

              <div className="relatorios-prioridades">
                {demandasPorPrioridade.map((item) => (
                  <div
                    key={item.prioridade}
                    className={`relatorios-prioridade ${item.prioridade.toLowerCase()}`}
                  >
                    <span>{item.prioridade}</span>
                    <strong>{item.quantidade}</strong>
                  </div>
                ))}
              </div>

              <div className="relatorios-taxa">
                <span>Taxa de conclusão</span>
                <strong>{taxaConclusao}%</strong>
                <div>
                  <span style={{ width: `${taxaConclusao}%` }} />
                </div>
              </div>
            </article>

            <article className="relatorios-card relatorios-card-tabela">
              <div className="relatorios-card-topo">
                <div>
                  <h2>Últimas demandas</h2>
                  <p>Registros mais recentes considerados no relatório.</p>
                </div>
              </div>

              <div className="relatorios-tabela-wrapper">
                <table className="relatorios-tabela">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Título</th>
                      <th>Oficina</th>
                      <th>Status</th>
                      <th>Prioridade</th>
                      <th>Prazo</th>
                    </tr>
                  </thead>

                  <tbody>
                    {demandasFiltradas.map((demanda) => (
                      <tr key={demanda.id}>
                        <td>{demanda.id.slice(0, 6)}</td>
                        <td>{demanda.titulo}</td>
                        <td>{demanda.oficina}</td>
                        <td>{demanda.status}</td>
                        <td>{demanda.prioridade}</td>
                        <td>{formatarData(demanda.dataHoraNecessaria)}</td>
                      </tr>
                    ))}

                    {demandasFiltradas.length === 0 && (
                      <tr>
                        <td colSpan={6}>Nenhuma demanda encontrada.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </article>
          </section>
        </section>
      </main>
    </div>
  );
}

export default Relatorios;
