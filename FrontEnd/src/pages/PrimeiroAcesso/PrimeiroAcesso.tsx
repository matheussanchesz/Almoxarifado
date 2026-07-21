import { useState } from "react";
import { FaEye, FaEyeSlash, FaLock, FaUser, FaKey } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import "../../styles/authFlow.css";

function PrimeiroAcesso() {
  const navigate = useNavigate();

  const [matricula, setMatricula] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [mostrarNovaSenha, setMostrarNovaSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function cadastrarSenha(evento: React.FormEvent) {
    evento.preventDefault();

    setErro("");

    if (!matricula || !novaSenha || !confirmarSenha) {
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
      // await api.post("/Auth/primeiro-acesso", { matricula, novaSenha });

      navigate("/login");
    } catch {
      setErro("Não foi possível cadastrar a senha.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="auth-pagina">
      <form className="auth-card" onSubmit={cadastrarSenha}>
        <header className="auth-logo">
          <h1>SENAI</h1>
        </header>

        <div className="auth-icone">
          <FaKey />
        </div>

        <h2>Primeiro acesso</h2>

        <span className="auth-subtitulo">
          Cadastre sua senha para continuar
        </span>

        <div className="auth-form">
          <div className="auth-grupo">
            <label>Matrícula</label>

            <div className="auth-input">
              <FaUser />

              <input
                type="text"
                placeholder="Digite sua matrícula"
                value={matricula}
                onChange={(evento) => setMatricula(evento.target.value)}
              />
            </div>
          </div>

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
            {carregando ? "Cadastrando..." : "Cadastrar senha"}
          </button>
        </div>
      </form>
    </main>
  );
}

export default PrimeiroAcesso;