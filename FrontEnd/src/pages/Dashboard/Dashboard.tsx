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
import "../../components/Sidebar/Sidebar.css";

import "./Dashboard.css";

const priorityData = [
  { name: "Urgente (vermelho)", value: 13, percent: "40%", color: "#ef233c" },
  { name: "Alta (amarelo)", value: 10, percent: "30%", color: "#ff8906" },
  { name: "Normal (azul)", value: 6, percent: "20%", color: "#2563eb" },
  { name: "Normal (verde)", value: 3, percent: "10%", color: "#22c55e" },
];

const statusData = [
  { name: "Abertas", value: 18, color: "#2563eb" },
  { name: "Em andamento", value: 9, color: "#2563eb" },
  { name: "Concluídas", value: 14, color: "#22c55e" },
  { name: "Atrasadas", value: 2, color: "#ef233c" },
];

const recentDemands = [
  {
    id: "#2024-082",
    title: "Troca de óleo do Motor",
    requester: "Lucas Silva",
    workshop: "Motores Ciclo Otto",
    deadline: "14/05/2024 08:00",
    priority: "Alta",
    priorityClass: "high",
    status: "Em Andamento",
    statusClass: "progress",
  },
  {
    id: "#2024-081",
    title: "Reparação de cabos elétricos",
    requester: "Mariana Costa",
    workshop: "Elétrica e Eletrônica",
    deadline: "14/05/2024 10:30",
    priority: "Normal",
    priorityClass: "normal",
    status: "Aguardando",
    statusClass: "waiting",
  },
  {
    id: "#2024-080",
    title: "Revisão em Freios",
    requester: "Carlos Eduardo",
    workshop: "Freios",
    deadline: "13/05/2024 14:00",
    priority: "Urgente",
    priorityClass: "urgent",
    status: "Em Andamento",
    statusClass: "progress",
  },
  {
    id: "#2024-079",
    title: "Preparar filtros e ignição",
    requester: "João Pedro",
    workshop: "Motores Veículos Pes.",
    deadline: "12/05/2024 09:30",
    priority: "Alta",
    priorityClass: "high",
    status: "Aguardando",
    statusClass: "waiting",
  },
];

export default function Dashboard() {
  return (
    <div className="dashboard-layout">
      <Sidebar />

      <main className="dashboard-main">
        <Header />

        <section className="stats-grid">
          <StatCard
            title="Demandas Abertas"
            value={32}
            description="Total em andamento"
            icon={<FiFileText />}
            variant="blue"
          />

          <StatCard
            title="Aguardando Atendimento"
            value={18}
            description="Histórico até a espera"
            icon={<FiClock />}
            variant="orange"
          />

          <StatCard
            title="Concluídas Hoje"
            value={14}
            description="Serviços realizados"
            icon={<FiCheck />}
            variant="green"
          />

          <StatCard
            title="Urgentes"
            value={2}
            description="Demandas em prazo"
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
                  <strong>32</strong>
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
                <YAxis tickLine={false} axisLine={false} />
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
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}