import { useEffect, useState } from "react";
import {
  FiCheck,
  FiClock,
  FiFileText,
  FiAlertTriangle,
} from "react-icons/fi";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

import Header from "../../components/Header/Header";
import Sidebar from "../../components/Sidebar/Sidebar";
import StatCard from "../../components/StatCard/StatCard";
import { listarDemandasApi, type DemandaApi } from "../../services/demandas";

import "../../components/Sidebar/Sidebar.css";
import "../../components/Header/Header.css";
import "./Dashboard.css";

function calcularPercentual(valor: number, total: number) {
  if (total === 0) return "0%";
  return `${Math.round((valor / total) * 100)}%`;
}

function formatarData(data: string) {
  return new Date(data).toLocaleString("pt-BR");
}

function obterClassePrioridade(prioridade: string) {
  if (prioridade === "Urgente") return "urgent";
  if (prioridade === "Alta") return "high";
  return "normal";
}

function obterClasseStatus(status: string) {
  if (status === "Em Andamento") return "progress";
  if (normalizar(status) === "concluida") return "done";
  if (status === "Cancelada") return "cancelled";
  return "waiting";
}

function normalizar(valor: string) {
  return valor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export default function Dashboard() {
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
          setErro("Nao foi possivel carregar os indicadores no momento.");
        }
      }
    }

    void carregarDemandas();

    return () => {
      ativo = false;
    };
  }, []);

  const totalDemandas = demandas.length;
  const abertas = demandas.filter((d) => d.status === "Aberta").length;
  const aguardandoAtendimento = demandas.filter(
    (d) => d.status === "Aberta" || normalizar(d.status) === "em analise"
  ).length;
  const emAndamento = demandas.filter((d) => d.status === "Em Andamento").length;
  const aguardandoMaterial = demandas.filter(
    (d) => d.status === "Aguardando Material"
  ).length;
  const concluidas = demandas.filter((d) => normalizar(d.status) === "concluida").length;
  const urgentes = demandas.filter((d) => d.prioridade === "Urgente").length;

  const prioridadeUrgente = demandas.filter(
    (d) => d.prioridade === "Urgente"
  ).length;
  const prioridadeAlta = demandas.filter((d) => d.prioridade === "Alta").length;
  const prioridadeNormal = demandas.filter(
    (d) => d.prioridade === "Normal"
  ).length;
  const prioridadeBaixa = demandas.filter((d) => d.prioridade === "Baixa").length;

  const priorityData = [
    {
      name: "Urgente (vermelho)",
      value: prioridadeUrgente,
      percent: calcularPercentual(prioridadeUrgente, totalDemandas),
      color: "#ef233c",
    },
    {
      name: "Alta (amarelo)",
      value: prioridadeAlta,
      percent: calcularPercentual(prioridadeAlta, totalDemandas),
      color: "#ff8906",
    },
    {
      name: "Normal (verde)",
      value: prioridadeNormal,
      percent: calcularPercentual(prioridadeNormal, totalDemandas),
      color: "#22c55e",
    },
    {
      name: "Baixa (azul)",
      value: prioridadeBaixa,
      percent: calcularPercentual(prioridadeBaixa, totalDemandas),
      color: "#2563eb",
    },
  ];

  const statusData = [
    { name: "Abertas", value: abertas, color: "#2563eb" },
    { name: "Em andamento", value: emAndamento, color: "#ff8906" },
    { name: "Aguard. material", value: aguardandoMaterial, color: "#7c3aed" },
    { name: "Concluídas", value: concluidas, color: "#22c55e" },
  ];

  const recentDemands = [...demandas]
    .sort(
      (a, b) =>
        new Date(b.dataHoraCriacao).getTime() -
        new Date(a.dataHoraCriacao).getTime()
    )
    .slice(0, 5)
    .map((demanda) => ({
      id: `#${demanda.id.slice(0, 8)}`,
      title: demanda.titulo,
      requester: demanda.professorNome,
      workshop: demanda.oficina,
      deadline: formatarData(demanda.dataHoraNecessaria),
      priority: demanda.prioridade,
      priorityClass: obterClassePrioridade(demanda.prioridade),
      status: demanda.status === "Aberta" ? "Aguardando" : demanda.status,
      statusClass: obterClasseStatus(demanda.status),
    }));

  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main">
        <Header />
        {erro && (
          <div className="dashboard-alert">
            Nao foi possivel atualizar os indicadores agora. Tente novamente em
            alguns instantes.
          </div>
        )}

        <section className="stats-grid">
          <StatCard
            title="Demandas Abertas"
            value={abertas}
            description={`${totalDemandas} demandas no total`}
            icon={<FiFileText />}
            variant="blue"
          />

          <StatCard
            title="Aguardando Atendimento"
            value={aguardandoAtendimento}
            description="Abertas ou em análise"
            icon={<FiClock />}
            variant="orange"
          />

          <StatCard
            title="Concluídas"
            value={concluidas}
            description="Serviços finalizados"
            icon={<FiCheck />}
            variant="green"
          />

          <StatCard
            title="Urgentes"
            value={urgentes}
            description="Demandas críticas"
            icon={<FiAlertTriangle />}
            variant="red"
          />
        </section>

        <section className="charts-grid">
          <div className="panel priority-panel">
            <h3>Demandas por Prioridade</h3>

            <div className="priority-content">
              <div className="donut-wrapper">
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={priorityData}
                      dataKey="value"
                      innerRadius={62}
                      outerRadius={102}
                      paddingAngle={1}
                    >
                      {priorityData.map((item) => (
                        <Cell key={item.name} fill={item.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>

                <div className="donut-center">
                  <strong>{totalDemandas}</strong>
                  <span>Total</span>
                </div>
              </div>

              <div className="priority-legend">
                {priorityData.map((item) => (
                  <div className="legend-row" key={item.name}>
                    <div>
                      <span
                        className="legend-dot"
                        style={{ backgroundColor: item.color }}
                      />
                      <span>{item.name}</span>
                    </div>

                    <strong>
                      {item.percent} ({item.value})
                    </strong>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="panel status-panel">
            <h3>Demandas por Status</h3>

            <ResponsiveContainer width="100%" height={275}>
              <BarChart data={statusData}>
                <CartesianGrid stroke="#e5e7eb" vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} allowDecimals={false} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={54}>
                  {statusData.map((item) => (
                    <Cell key={item.name} fill={item.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="panel table-panel">
          <h3>Demandas Recentes</h3>

          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Título</th>
                <th>Solicitante</th>
                <th>Oficina / Localização</th>
                <th>Prazo</th>
                <th>Prioridade</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {recentDemands.map((demand) => (
                <tr key={demand.id}>
                  <td>{demand.id}</td>
                  <td>{demand.title}</td>
                  <td>{demand.requester}</td>
                  <td>{demand.workshop}</td>
                  <td>{demand.deadline}</td>
                  <td>
                    <span className={`badge priority ${demand.priorityClass}`}>
                      {demand.priority}
                    </span>
                  </td>
                  <td>
                    <span className={`badge status ${demand.statusClass}`}>
                      {demand.status}
                    </span>
                  </td>
                </tr>
              ))}

              {recentDemands.length === 0 && (
                <tr>
                  <td colSpan={7}>Nenhuma demanda encontrada.</td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}
