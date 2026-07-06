import { FiMenu } from "react-icons/fi";

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
    </header>
  );
}
