import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft, FiEye, FiSearch } from "react-icons/fi";

import Sidebar from "../../components/Sidebar/Sidebar";
import {
  listarExecucoesChecklistApi,
  type ExecucaoChecklistApi,
} from "../../services/checklists";

import "./HistoricoChecklists.css";

function formatarData(data: string) {
  return new Date(data).toLocaleString("pt-BR");
}

function HistoricoChecklists() {
  const navigate = useNavigate();
  const [busca, setBusca] = useState("");
  const [almoxarife, setAlmoxarife] = useState("");
  const [dataInicial, setDataInicial] = useState("");
  const [dataFinal, setDataFinal] = useState("");
  const [execucoes, setExecucoes] = useState<ExecucaoChecklistApi[]>([]);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;

    async function carregarExecucoes() {
      try {
        const dados = await listarExecucoesChecklistApi();

        if (ativo) {
          setExecucoes(dados);
          setErro("");
        }
      } catch {
        if (ativo) {
      setErro("Não foi possível carregar o histórico no momento.");
        }
      }
    }

    void carregarExecucoes();

    return () => {
      ativo = false;
    };
  }, []);

  const almoxarifes = [...new Set(execucoes.map((e) => e.almoxarifeNome))];

  const totais = useMemo(() => {
    const itens = execucoes.flatMap((e) => e.itens);

    return {
      total: execucoes.length,
      conformes: itens.filter((i) => i.status === "Conforme").length,
      faltantes: itens.filter((i) => i.status === "Faltante").length,
      danificados: itens.filter((i) => i.status === "Danificado").length,
    };
  }, [execucoes]);

  const historicoFiltrado = useMemo(() => {
    const termo = busca.toLowerCase();

    return execucoes.filter((execucao) => {
      const dataExecucao = new Date(execucao.dataExecucao);

      const correspondeBusca =
        execucao.checklistId.toLowerCase().includes(termo) ||
        execucao.almoxarifeNome.toLowerCase().includes(termo);

      const correspondeAlmoxarife =
        !almoxarife || execucao.almoxarifeNome === almoxarife;

      const correspondeDataInicial =
        !dataInicial || dataExecucao >= new Date(`${dataInicial}T00:00:00`);

      const correspondeDataFinal =
        !dataFinal || dataExecucao <= new Date(`${dataFinal}T23:59:59`);

      return (
        correspondeBusca &&
        correspondeAlmoxarife &&
        correspondeDataInicial &&
        correspondeDataFinal
      );
    });
  }, [busca, almoxarife, dataInicial, dataFinal, execucoes]);

  return (
    <div className="historico-layout">
      <Sidebar />

      <main className="historico-main">
        <section className="historico-conteudo">
          <header className="historico-cabecalho">
            <button
              type="button"
              className="historico-voltar"
              onClick={() => navigate("/checklists")}
            >
              <FiArrowLeft />
              Voltar
            </button>

            <h1>Histórico de Checklists</h1>
              <p>Consulte as execuções registradas no sistema.</p>
          </header>

          {erro && <p style={{ color: "#b91c1c", marginBottom: 12 }}>{erro}</p>}

          <section className="historico-indicadores">
            <div>
              <strong>{totais.total}</strong>
              <span>Execuções</span>
            </div>

            <div className="ok">
              <strong>{totais.conformes}</strong>
              <span>Itens conformes</span>
            </div>

            <div className="alerta">
              <strong>{totais.faltantes}</strong>
              <span>Itens faltantes</span>
            </div>

            <div className="critico">
              <strong>{totais.danificados}</strong>
              <span>Itens danificados</span>
            </div>
          </section>

          <section className="historico-filtros">
            <div className="historico-busca">
              <FiSearch />
              <input
                type="text"
                placeholder="Buscar por checklist ou almoxarife..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
              />
            </div>

            <select
              value={almoxarife}
              onChange={(e) => setAlmoxarife(e.target.value)}
            >
              <option value="">Todos os almoxarifes</option>
              {almoxarifes.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>

            <input
              type="date"
              value={dataInicial}
              onChange={(e) => setDataInicial(e.target.value)}
            />

            <input
              type="date"
              value={dataFinal}
              onChange={(e) => setDataFinal(e.target.value)}
            />
          </section>

          <div className="historico-card">
            <div className="historico-tabela-wrapper">
              <table className="historico-tabela">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Checklist</th>
                    <th>Almoxarife</th>
                    <th>Status</th>
                    <th>Itens</th>
                    <th>Ações</th>
                  </tr>
                </thead>

                <tbody>
                  {historicoFiltrado.map((execucao) => (
                    <tr key={execucao.id}>
                      <td>{formatarData(execucao.dataExecucao)}</td>
                      <td>{execucao.checklistId}</td>
                      <td>{execucao.almoxarifeNome}</td>
                      <td>
                        <span className="historico-categoria">
                          {execucao.status}
                        </span>
                      </td>
                      <td>{execucao.itens.length}</td>
                      <td>
                        <button
                          type="button"
                          className="historico-acao"
                          onClick={() =>
                            navigate(`/checklists/visualizar/${execucao.id}`)
                          }
                        >
                          <FiEye />
                          Visualizar
                        </button>
                      </td>
                    </tr>
                  ))}

                  {historicoFiltrado.length === 0 && (
                    <tr>
                      <td colSpan={6} className="historico-vazio">
                        Nenhuma execução encontrada.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default HistoricoChecklists;
