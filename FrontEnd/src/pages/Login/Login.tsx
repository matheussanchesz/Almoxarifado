import { useState } from "react";
import {
  FaLock,
  FaUser,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import { login } from "../../services/auth";
import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const [matricula, setMatricula] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);

  async function entrar(evento: React.FormEvent) {
    evento.preventDefault();

    setErro("");

    if (!matricula || !dataNascimento) {
      setErro("Preencha matrícula e senha.");
      return;
    }

    try {
      setCarregando(true);

      const resultado = await login(matricula, dataNascimento);

      if (resultado.precisaCompletarCadastro) {
        navigate("/primeiro-acesso", {
          state: {
            matricula,
            dataNascimento,
          },
        });
        return;
      }

      navigate("/dashboard");
    } catch {
      setErro("Matrícula ou senha inválida.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="login-pagina">
      <section className="login-conteudo">
        <header className="login-logo">
          <h1>SENAI</h1>
        </header>

        <form className="login-card" onSubmit={entrar}>
          <div className="login-icone">
            <FaLock />
          </div>

          <h2>Bem-vindo(a)!</h2>
          <span>Acesse sua conta para continuar</span>

          <div className="campo-grupo">
            <label>Matrícula</label>

            <div className="campo-input">
              <FaUser />
              <input
                type="text"
                placeholder="Digite sua matrícula"
                value={matricula}
                onChange={(e) => setMatricula(e.target.value)}
              />
            </div>
          </div>

          <div className="campo-grupo">
            <label>Senha</label>

            <div className="campo-input">
              <FaLock />
              <input
                type={mostrarSenha ? "text" : "password"}
                placeholder="Digite sua senha"
                value={dataNascimento}
                onChange={(e) => setDataNascimento(e.target.value)}
              />

              <button
                type="button"
                className="botao-ver-senha"
                onClick={() => setMostrarSenha(!mostrarSenha)}
                aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
              >
                {mostrarSenha ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <button
            type="button"
            className="botao-esqueceu"
            onClick={() => navigate("/recuperar-acesso")}
          >
            Recuperar acesso
          </button>

          {erro && <p className="mensagem-erro">{erro}</p>}

          <button type="submit" className="botao-entrar" disabled={carregando}>
            {carregando ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <footer className="login-rodape">
          <span></span>
        </footer>
      </section>
    </main>
  );
}

export default Login;
