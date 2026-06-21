import { FiBell, FiChevronDown, FiMenu, FiUser } from "react-icons/fi";

import "./Header.css";

export default function Header() {
  return (
    <header className="header">
      <div className="header-title">
        <FiMenu />
        <h2>Dashboard</h2>
      </div>

      <div className="header-actions">
        <button className="notification">
          <FiBell />
          <span>3</span>
        </button>

        <button className="profile-button">
          <FiUser />
          <span>Coordenador</span>
          <FiChevronDown />
        </button>
      </div>
    </header>
  );
}