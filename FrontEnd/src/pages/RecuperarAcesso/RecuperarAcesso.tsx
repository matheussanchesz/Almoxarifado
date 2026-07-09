import { useState } from "react";
import { FaEnvelope } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import { recuperarAcesso } from "../../services/auth";
import "../../styles/authFlow.css";

function RecuperarAcesso() {
  const navigate = useNavigate();

  const [identificador, setIdentificador] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function enviarRecuperacao(evento: React.FormEvent) {
    evento.preventDefault();

    setErro("");

    if (!identificador.trim()) {
      setErro("Informe seu e-mail ou matricula.");
      return;
    }

    try {
      setCarregando(true);
      const resposta = await recuperarAcesso(identificador.trim());

      navigate("/email-enviado", {
        state: {
          mensagem: resposta.mensagem,
          email: resposta.email,
        },
      });
    } catch {
      setErro("Nao encontramos um usuario ativo com esses dados.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="auth-pagina">
      <form className="auth-card" onSubmit={enviarRecuperacao}>
        <header className="auth-logo">
          <h1>SENAI</h1>
          <p>AUTOMOTIVO</p>
          <p>CAXIAS DO SUL</p>
        </header>

        <div className="auth-icone">
          <FaEnvelope />
        </div>

        <h2>Recuperar acesso</h2>

        <span className="auth-subtitulo">
          Informe seu e-mail ou matricula para localizar seu cadastro.
        </span>

        <div className="auth-form">
          <div className="auth-grupo">
            <label>E-mail ou matricula</label>

            <div className="auth-input">
              <FaEnvelope />

              <input
                type="text"
                placeholder="Digite seu e-mail ou matricula"
                value={identificador}
                onChange={(evento) => setIdentificador(evento.target.value)}
              />
            </div>
          </div>

          {erro && <p className="auth-mensagem-erro">{erro}</p>}

          <button type="submit" className="auth-botao" disabled={carregando}>
            {carregando ? "Consultando..." : "Continuar"}
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
