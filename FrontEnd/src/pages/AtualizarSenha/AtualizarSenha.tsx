import { useState } from "react";
import { FaEye, FaEyeSlash, FaLock } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import "../../styles/authFlow.css";

function AtualizarSenha() {
  const navigate = useNavigate();

  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [mostrarNovaSenha, setMostrarNovaSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function redefinirSenha(evento: React.FormEvent) {
    evento.preventDefault();

    setErro("");

    if (!novaSenha || !confirmarSenha) {
      setErro("Preencha todos os campos.");
      return;
    }

    if (novaSenha !== confirmarSenha) {
      setErro("As senhas não conferem.");
      return;
    }

    try {
      setCarregando(true);

      // Depois conectar com a API.
      // await api.post("/Auth/redefinir-senha", { novaSenha });

      navigate("/senha-redefinida");
    } catch {
      setErro("Não foi possível redefinir a senha.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="auth-pagina">
      <form className="auth-card" onSubmit={redefinirSenha}>
        <header className="auth-logo">
          <h1>SENAI</h1>
        </header>

        <div className="auth-icone">
          <FaLock />
        </div>

        <h2>Crie uma nova senha</h2>

        <span className="auth-subtitulo">
          Digite e confirme sua nova senha para continuar.
        </span>

        <div className="auth-form">
          <div className="auth-grupo">
            <label>Nova senha</label>

            <div className="auth-input">
              <FaLock />

              <input
                type={mostrarNovaSenha ? "text" : "password"}
                placeholder="Digite sua nova senha"
                value={novaSenha}
                onChange={(evento) => setNovaSenha(evento.target.value)}
              />

              <button
                type="button"
                className="auth-botao-olho"
                onClick={() => setMostrarNovaSenha(!mostrarNovaSenha)}
              >
                {mostrarNovaSenha ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div className="auth-grupo">
            <label>Confirmar senha</label>

            <div className="auth-input">
              <FaLock />

              <input
                type={mostrarConfirmarSenha ? "text" : "password"}
                placeholder="Confirme sua nova senha"
                value={confirmarSenha}
                onChange={(evento) => setConfirmarSenha(evento.target.value)}
              />

              <button
                type="button"
                className="auth-botao-olho"
                onClick={() => setMostrarConfirmarSenha(!mostrarConfirmarSenha)}
              >
                {mostrarConfirmarSenha ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          {erro && <p className="auth-mensagem-erro">{erro}</p>}

          <button type="submit" className="auth-botao" disabled={carregando}>
            {carregando ? "Redefinindo..." : "Redefinir senha"}
          </button>
        </div>
      </form>
    </main>
  );
}

export default AtualizarSenha;