import { FaCheck } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";

import "../../styles/authFlow.css";

type EmailEnviadoState = {
  mensagem?: string;
  email?: string;
};

function EmailEnviado() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state ?? {}) as EmailEnviadoState;

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

        <h2>Acesso localizado</h2>

        <p className="auth-texto">
          {state.mensagem ??
            "Seu cadastro foi localizado. Volte para o login e entre com sua matricula e data de nascimento."}
        </p>

        {state.email && (
          <p className="auth-texto">
            E-mail cadastrado: <strong>{state.email}</strong>
          </p>
        )}

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
