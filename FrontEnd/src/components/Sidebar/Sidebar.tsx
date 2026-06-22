import { useNavigate } from "react-router-dom";
import {
  FiArchive,
  FiBarChart2,
  FiChevronDown,
  FiClipboard,
  FiFileText,
  FiHome,
  FiSettings,
  FiShoppingCart,
  FiUsers,
} from "react-icons/fi";

import "./Sidebar.css";

type SidebarProps = {
  paginaAtiva?: string;
};

const itensMenu = [
  { icone: <FiHome />, titulo: "Dashboard", caminho: "/dashboard" },
  { icone: <FiFileText />, titulo: "Demandas", caminho: "/demandas" },
  { icone: <FiClipboard />, titulo: "Checklists", caminho: "#" },
  { icone: <FiArchive />, titulo: "Almoxarifado", caminho: "#" },
  { icone: <FiShoppingCart />, titulo: "Compras", caminho: "#" },
  { icone: <FiBarChart2 />, titulo: "Relatórios", caminho: "#" },
  { icone: <FiUsers />, titulo: "Usuários", caminho: "#" },
  { icone: <FiSettings />, titulo: "Configurações", caminho: "#" },
];

export default function Sidebar({ paginaAtiva = "Dashboard" }: SidebarProps) {
  const navigate = useNavigate();

  function abrirPagina(caminho: string) {
    if (caminho !== "#") {
      navigate(caminho);
    }
  }

  return (
    <aside className="sidebar">
      <div>
        <div className="sidebar-logo">
          <h1>SENAI</h1>
          <span>AUTOMOTIVO</span>
          <span>CAXIAS DO SUL</span>
        </div>

        <nav className="sidebar-menu">
          {itensMenu.map((item) => (
            <button
              key={item.titulo}
              type="button"
              onClick={() => abrirPagina(item.caminho)}
              className={`sidebar-item ${paginaAtiva === item.titulo ? "active" : ""}`}
            >
              {item.icone}
              <span>{item.titulo}</span>
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
