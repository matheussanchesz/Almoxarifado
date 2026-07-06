import { FiBell, FiChevronDown, FiMenu, FiUser } from "react-icons/fi";

import "./Header.css";

type HeaderProps = {
  titulo?: string;
};

export default function Header({ titulo = "Dashboard" }: HeaderProps) {
  return (
    <header className="header">
      <div className="header-title">
        <FiMenu />
        <h2>{titulo}</h2>
      </div>

      <div className="header-actions">
        <button className="notification" type="button" aria-label="Notificações">
          <FiBell />
          <span>3</span>
        </button>

        <button className="profile-button" type="button">
          <FiUser />
          <span>Coordenador</span>
          <FiChevronDown />
        </button>
      </div>
    </header>
  );
}
