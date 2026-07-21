import { FaCheck } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import "../../styles/authFlow.css";

function EmailEnviado() {
  const navigate = useNavigate();

  return (
    <main className="auth-pagina">
      <section className="auth-card">
        <header className="auth-logo">
          <h1>SENAI</h1>
        </header>

        <div className="auth-icone sucesso">
          <FaCheck />
        </div>

        <h2>E-mail enviado!</h2>

        <p className="auth-texto">
          Enviamos um link de recuperação para o e-mail informado.
          Verifique sua caixa de entrada.
        </p>

        <button
          type="button"
          className="auth-link"
          onClick={() => navigate("/login")}
        >
          Voltar para o login
        </button>
      </section>
    </main>
  );
}

export default EmailEnviado;