import { NavLink } from "react-router-dom";
import {
  FiArchive,
  FiBarChart2,
  FiBell,
  FiChevronDown,
  FiClipboard,
  FiFileText,
  FiHome,
  FiPlusCircle,
  FiShoppingCart,
  FiUsers,
} from "react-icons/fi";
import React from "react";
import "./Sidebar.css";

type Perfil = "Admin" | "Coordenador" | "Professor" | "Almoxarife";

type ItemMenu = {
  icone: React.ReactNode;
  titulo: string;
  caminho: string;
  perfis: Perfil[];
};

const itensMenu: ItemMenu[] = [
  {
    icone: <FiHome />,
    titulo: "Dashboard",
    caminho: "/dashboard",
    perfis: ["Admin", "Coordenador", "Professor", "Almoxarife"],
  },
  {
    icone: <FiFileText />,
    titulo: "Demandas",
    caminho: "/demandas",
    perfis: ["Admin", "Coordenador", "Professor", "Almoxarife"],
  },
  {
    icone: <FiArchive />,
    titulo: "Fila Almoxarifado",
    caminho: "/almoxarifado",
    perfis: ["Admin", "Coordenador", "Almoxarife"],
  },
  {
    icone: <FiClipboard />,
    titulo: "Checklists",
    caminho: "/checklists",
    perfis: ["Admin", "Coordenador", "Almoxarife"],
  },
  {
    icone: <FiShoppingCart />,
    titulo: "Compras",
    caminho: "/compras",
    perfis: ["Admin", "Coordenador", "Almoxarife"],
  },
  {
    icone: <FiBarChart2 />,
    titulo: "Relatórios",
    caminho: "/relatorios",
    perfis: ["Admin", "Coordenador"],
  },
  {
    icone: <FiUsers />,
    titulo: "Usuários",
    caminho: "/usuarios",
    perfis: ["Admin", "Coordenador"],
  },
  {
    icone: <FiBell />,
    titulo: "Notificações",
    caminho: "/notificacoes",
    perfis: ["Admin", "Coordenador", "Professor", "Almoxarife"],
  },
];

function obterUsuarioLogado() {
  const usuarioSalvo = localStorage.getItem("@senai:user");

  if (!usuarioSalvo) {
    return {
      nome: "Usuário",
      matricula: "",
      perfil: "Coordenador" as Perfil,
    };
  }

  try {
    return JSON.parse(usuarioSalvo) as {
      nome: string;
      matricula: string;
      perfil: Perfil;
    };
  } catch {
    return {
      nome: "Usuário",
      matricula: "",
      perfil: "Coordenador" as Perfil,
    };
  }
}

function gerarIniciais(nome: string) {
  return nome
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0])
    .join("")
    .toUpperCase();
}

export default function Sidebar() {
  const usuario = obterUsuarioLogado();

  const itensPermitidos = itensMenu.filter((item) =>
    item.perfis.includes(usuario.perfil)
  );

  return (
    <aside className="sidebar">
      <div>
        <div className="sidebar-logo">
          <h1>SENAI</h1>
          <span>AUTOMOTIVO</span>
          <span>CAXIAS DO SUL</span>
        </div>

        <nav className="sidebar-menu">
          {itensPermitidos.map((item) => (
            <NavLink
              key={item.titulo}
              to={item.caminho}
              className={({ isActive }) =>
                `sidebar-item ${isActive ? "active" : ""}`
              }
            >
              {item.icone}
              <span>{item.titulo}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="sidebar-user">
        <div className="avatar">{gerarIniciais(usuario.nome)}</div>

        <div className="sidebar-user-info">
          <strong>{usuario.nome}</strong>
          <span>{usuario.perfil}</span>
        </div>

        <FiChevronDown className="sidebar-user-arrow" />
      </div>
    </aside>
  );
}