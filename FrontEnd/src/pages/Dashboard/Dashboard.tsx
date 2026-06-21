import "./Dashboard.css";

export default function Dashboard() {
  return (
    <div className="dashboard">
      <h1>Dashboard Almoxarifado SENAI</h1>

      <div className="cards">
        <div className="card">
          <h3>Demandas Abertas</h3>
          <span>32</span>
        </div>

        <div className="card">
          <h3>Aguardando Atendimento</h3>
          <span>18</span>
        </div>

        <div className="card">
          <h3>Concluídas Hoje</h3>
          <span>14</span>
        </div>

        <div className="card">
          <h3>Urgentes</h3>
          <span>2</span>
        </div>
      </div>
    </div>
  );
}