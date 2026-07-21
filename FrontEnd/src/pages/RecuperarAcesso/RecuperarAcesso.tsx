import { useState } from "react";
import { FaEnvelope } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import "../../styles/authFlow.css";

function RecuperarAcesso() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function enviarEmail(evento: React.FormEvent) {
    evento.preventDefault();

    setErro("");

    if (!email) {
      setErro("Digite seu e-mail.");
      return;
    }

    try {
      setCarregando(true);

      // Depois conectar com a API.
      // await api.post("/Auth/recuperar-acesso", { email });

      navigate("/email-enviado");
    } catch {
      setErro("E-mail não cadastrado.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="auth-pagina">
      <form className="auth-card" onSubmit={enviarEmail}>
        <header className="auth-logo">
          <h1>SENAI</h1>
        </header>

        <div className="auth-icone">
          <FaEnvelope />
        </div>

        <h2>Esqueci minha senha</h2>

        <span className="auth-subtitulo">
          Informe seu e-mail cadastrado para receber as instruções de recuperação.
        </span>

        <div className="auth-form">
          <div className="auth-grupo">
            <label>E-mail</label>

            <div className="auth-input">
              <FaEnvelope />

              <input
                type="email"
                placeholder="Digite seu e-mail"
                value={email}
                onChange={(evento) => setEmail(evento.target.value)}
              />
            </div>
          </div>

          {erro && <p className="auth-mensagem-erro">{erro}</p>}

          <button type="submit" className="auth-botao" disabled={carregando}>
            {carregando ? "Enviando..." : "Enviar"}
          </button>
        </div>

        <button
          type="button"
          className="auth-link"
          onClick={() => navigate("/login")}
        >
          Voltar para o login
        </button>
      </form>
    </main>
  );
}

export default RecuperarAcesso;