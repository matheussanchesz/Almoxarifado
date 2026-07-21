import { useState } from "react";
import {
  FaLock,
  FaUser,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { FiMoon, FiSun } from "react-icons/fi";

import { login } from "../../services/auth";
import {
  alternarTema,
  getTemaSalvo,
  type ThemeMode,
} from "../../services/theme";
import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const [matricula, setMatricula] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [tema, setTema] = useState<ThemeMode>(getTemaSalvo);

  function mudarTema() {
    setTema(alternarTema());
  }

  async function entrar(evento: React.FormEvent) {
    evento.preventDefault();

    setErro("");

    if (!matricula || !dataNascimento) {
      setErro("Preencha matrícula e senha.");
      return;
    }

    try {
      setCarregando(true);

      await login(matricula, dataNascimento);

      navigate("/dashboard");
    } catch {
      setErro("Matrícula ou senha inválida.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="login-pagina">
      <button
        type="button"
        className="login-tema-flutuante"
        onClick={mudarTema}
        aria-label={tema === "dark" ? "Ativar modo claro" : "Ativar modo escuro"}
        title={tema === "dark" ? "Modo claro" : "Modo escuro"}
      >
        {tema === "dark" ? <FiSun /> : <FiMoon />}
        <span>{tema === "dark" ? "Modo claro" : "Modo escuro"}</span>
      </button>

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
