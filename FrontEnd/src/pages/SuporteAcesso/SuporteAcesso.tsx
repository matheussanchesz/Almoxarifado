import { FaExclamationTriangle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import "../../styles/authFlow.css";

function SuporteAcesso() {
  const navigate = useNavigate();

  function solicitarSuporte() {
    alert("Solicitação de suporte enviada.");
    navigate("/login");
  }

  return (
    <main className="auth-pagina">
      <section className="auth-card">
        <header className="auth-logo">
          <h1>SENAI</h1>
          <p>AUTOMOTIVO</p>
          <p>CAXIAS DO SUL</p>
        </header>

        <div className="auth-icone erro">
          <FaExclamationTriangle />
        </div>

        <h2>E-mail não cadastrado</h2>

        <p className="auth-texto">
          Não encontramos este e-mail em nossos registros.
          Entre em contato com o suporte.
        </p>

        <button
          type="button"
          className="auth-botao"
          onClick={solicitarSuporte}
        >
          Solicitar suporte
        </button>
      </section>
    </main>
  );
}

export default SuporteAcesso;