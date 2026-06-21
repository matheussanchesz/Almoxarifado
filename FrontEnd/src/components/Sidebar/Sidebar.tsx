import {
  FiHome,
  FiFileText,
  FiClipboard,
  FiArchive,
  FiShoppingCart,
  FiBarChart2,
  FiUsers,
  FiSettings,
  FiChevronDown,
} from "react-icons/fi";

import "./Sidebar.css";

const menuItems = [
  { icon: <FiHome />, label: "Dashboard", active: true },
  { icon: <FiFileText />, label: "Demandas" },
  { icon: <FiClipboard />, label: "Checklists" },
  { icon: <FiArchive />, label: "Almoxarifado" },
  { icon: <FiShoppingCart />, label: "Compras" },
  { icon: <FiBarChart2 />, label: "Relatórios" },
  { icon: <FiUsers />, label: "Usuários" },
  { icon: <FiSettings />, label: "Configurações" },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div>
        <div className="sidebar-logo">
          <h1>SENAI</h1>
          <span>AUTOMOTIVO</span>
          <span>CAXIAS DO SUL</span>
        </div>

        <nav className="sidebar-menu">
          {menuItems.map((item) => (
            <button
              key={item.label}
              className={`sidebar-item ${item.active ? "active" : ""}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="sidebar-user">
        <div className="avatar">JP</div>

        <div className="sidebar-user-info">
          <strong>João Pedro</strong>
          <span>Coordenador</span>
        </div>

        <FiChevronDown className="sidebar-user-arrow" />
      </div>
    </aside>
  );
}