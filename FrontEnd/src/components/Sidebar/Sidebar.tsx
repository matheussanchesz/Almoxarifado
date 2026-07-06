import { NavLink, useNavigate } from "react-router-dom";
import {
  FiArchive,
  FiBarChart2,
  FiBell,
  FiChevronDown,
  FiClipboard,
  FiFileText,
  FiHome,
  FiLogOut,
  FiShoppingCart,
  FiUsers,
} from "react-icons/fi";
import React, { useState } from "react";
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
    perfis: ["Admin", "Coordenador","Professor", "Almoxarife" ],
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
  const navigate = useNavigate();
  const usuario = obterUsuarioLogado();
  const [menuUsuarioAberto, setMenuUsuarioAberto] = useState(false);

  const itensPermitidos = itensMenu.filter((item) =>
    item.perfis.includes(usuario.perfil),
  );

  function sairDaConta() {
    localStorage.removeItem("@senai:user");
    localStorage.removeItem("@senai:token");

    navigate("/login");
  }

  return (
    <aside className="sidebar">
      <div>
        <div className="sidebar-logo">
          <h1>SENAI</h1>
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

      <div className="sidebar-user-wrapper">
        <button
          type="button"
          className="sidebar-user"
          onClick={() => setMenuUsuarioAberto((estadoAtual) => !estadoAtual)}
        >
          <div className="avatar">{gerarIniciais(usuario.nome)}</div>

          <div className="sidebar-user-info">
            <strong>{usuario.nome}</strong>
            <span>{usuario.perfil}</span>
          </div>

          <FiChevronDown
            className={`sidebar-user-arrow ${
              menuUsuarioAberto ? "aberto" : ""
            }`}
          />
        </button>

        {menuUsuarioAberto && (
          <div className="sidebar-user-menu">
            <button type="button" onClick={sairDaConta}>
              <FiLogOut />
              Sair da conta
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}