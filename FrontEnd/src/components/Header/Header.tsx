import { FiMenu, FiLogOut, FiMoon } from "react-icons/fi";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUsuarioLogado, logout } from "../../services/auth";
import { alternarTema } from "../../services/theme";
import "./Header.css";

type HeaderProps = {
  titulo?: string;
};

function gerarIniciais(nome: string) {
  return nome
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0])
    .join("")
    .toUpperCase();
}

export default function Header({ titulo = "Dashboard" }: HeaderProps) {
  const [perfilAberto, setPerfilAberto] = useState(false);
  const navigate = useNavigate();
  const usuario = getUsuarioLogado();
  const nomeUsuario = usuario?.nome ?? "Usuario";
  const iniciais = gerarIniciais(nomeUsuario) || "SN";

  function abrirMenuMobile() {
    window.dispatchEvent(new CustomEvent("abrir-menu-mobile"));
  }

  function alternarModoEscuro() {
    alternarTema();
    setPerfilAberto(false);
  }

  function sair() {
    logout();
    navigate("/");
  }

  return (
    <header className="header">
      <div className="header-title">
        <button
          type="button"
          className="header-menu-button"
          onClick={abrirMenuMobile}
        >
          <FiMenu />
        </button>

        {titulo && <h2>{titulo}</h2>}
      </div>

      <div className="header-profile">
        <button
          type="button"
          className="header-avatar"
          onClick={() => setPerfilAberto(!perfilAberto)}
          aria-expanded={perfilAberto}
        >
          {iniciais}
        </button>

        {perfilAberto && (
          <div className="header-profile-card">
            <div className="header-profile-user">
              <strong>{nomeUsuario}</strong>
              <span>{usuario?.perfil ?? "Perfil"}</span>
            </div>

            <button type="button" onClick={alternarModoEscuro}>
              <FiMoon />
              Modo escuro
            </button>

            <button type="button" className="sair" onClick={sair}>
              <FiLogOut />
              Sair
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
