import React, { useEffect, useState } from "react";
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
  FiMoon,
  FiShoppingCart,
  FiUsers,
  FiX,
} from "react-icons/fi";

import "./Sidebar.css";
import { alternarTema } from "../../services/theme";
import { temPermissao, type Recurso } from "../../services/permissoes";

type Perfil = "Desenvolvedor" | "Admin" | "Coordenador" | "Professor" | "Almoxarife" | "Almoxarifado";

type ItemMenu = {
  icone: React.ReactNode;
  titulo: string;
  caminho: string;
  recurso: Recurso;
};

const itensMenu: ItemMenu[] = [
  {
    icone: <FiHome />,
    titulo: "Dashboard",
    caminho: "/dashboard",
    recurso: "dashboard",
  },
  {
    icone: <FiFileText />,
    titulo: "Demandas",
    caminho: "/demandas",
    recurso: "demandas",
  },
  {
    icone: <FiArchive />,
    titulo: "Almoxarifado",
    caminho: "/almoxarifado",
    recurso: "almoxarifado",
  },
  {
    icone: <FiShoppingCart />,
    titulo: "Compras",
    caminho: "/compras",
    recurso: "compras",
  },
  {
    icone: <FiClipboard />,
    titulo: "Checklists",
    caminho: "/checklists",
    recurso: "checklists",
  },
  {
    icone: <FiBarChart2 />,
    titulo: "Relatórios",
    caminho: "/relatorios",
    recurso: "relatorios",
  },
  {
    icone: <FiUsers />,
    titulo: "Usuários",
    caminho: "/usuarios",
    recurso: "usuarios",
  },
  {
    icone: <FiBell />,
    titulo: "Notificações",
    caminho: "/notificacoes",
    recurso: "notificacoes",
  },
];

function obterUsuarioLogado() {
  const usuarioSalvo = localStorage.getItem("@senai:user");

  if (!usuarioSalvo) {
    return { nome: "Usuário", matricula: "", perfil: "Coordenador" as Perfil };
  }

  try {
    return JSON.parse(usuarioSalvo) as {
      nome: string;
      matricula: string;
      perfil: Perfil;
    };
  } catch {
    return { nome: "Usuário", matricula: "", perfil: "Coordenador" as Perfil };
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

  const [menuAberto, setMenuAberto] = useState(false);
  const [menuUsuarioAberto, setMenuUsuarioAberto] = useState(false);

  const itensPermitidos = itensMenu.filter((item) =>
    temPermissao(usuario.perfil, item.recurso),
  );

  useEffect(() => {
    function abrirMenu() {
      setMenuAberto(true);
    }

    window.addEventListener("abrir-menu-mobile", abrirMenu);

    return () => {
      window.removeEventListener("abrir-menu-mobile", abrirMenu);
    };
  }, []);

  function sairDaConta() {
    localStorage.removeItem("@senai:user");
    localStorage.removeItem("@senai:token");
    navigate("/login");
  }

  function alternarModoEscuro() {
    alternarTema();
    setMenuUsuarioAberto(false);
  }

  return (
    <>
      <div
        className={`sidebar-overlay ${menuAberto ? "show" : ""}`}
        onClick={() => setMenuAberto(false)}
      />

      <aside className={`sidebar ${menuAberto ? "mobile-open" : ""}`}>
        <div>
          <div className="sidebar-logo-row">
            <div className="sidebar-logo">
              <h1>SENAI</h1>
            </div>

            <button
              type="button"
              className="sidebar-close"
              onClick={() => setMenuAberto(false)}
              aria-label="Fechar menu"
            >
              <FiX />
            </button>
          </div>

          <nav className="sidebar-menu">
            {itensPermitidos.map((item) => (
              <NavLink
                key={item.titulo}
                to={item.caminho}
                onClick={() => {
                  setMenuAberto(false);
                  setMenuUsuarioAberto(false);
                }}
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
            aria-expanded={menuUsuarioAberto}
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
              <button type="button" onClick={alternarModoEscuro}>
                <FiMoon />
                Modo escuro
              </button>

              <button type="button" className="sair" onClick={sairDaConta}>
                <FiLogOut />
                Sair da conta
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
