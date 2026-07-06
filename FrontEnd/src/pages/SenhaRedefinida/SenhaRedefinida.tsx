import { FaCheck } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import "../../styles/authFlow.css";

function SenhaRedefinida() {
  const navigate = useNavigate();

  return (
    <main className="auth-pagina">
      <section className="auth-card">
        <header className="auth-logo">
          <h1>SENAI</h1>
          <p>AUTOMOTIVO</p>
          <p>CAXIAS DO SUL</p>
        </header>

        <div className="auth-icone sucesso">
          <FaCheck />
        </div>

        <h2>Senha redefinida!</h2>

        <p className="auth-texto">
          Sua senha foi alterada com sucesso.
          Faça login para continuar.
        </p>

        <button
          type="button"
          className="auth-botao"
          onClick={() => navigate("/login")}
        >
          Ir para o login
        </button>
      </section>
    </main>
  );
}

export default SenhaRedefinida;