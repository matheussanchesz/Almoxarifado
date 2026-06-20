import { useState } from "react";
import {
  FaLock,
  FaUser,
  FaCalendarAlt,
  FaClipboardList,
  FaTools,
  FaBoxOpen,
  FaChartBar,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import { api } from "../../services/api";
import "./Login.css";

function Login() {
  const navigate = useNavigate();
  const [matricula, setMatricula] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function entrar(evento: React.FormEvent) {
    evento.preventDefault();

    setErro("");

    if (!matricula || !dataNascimento) {
      setErro("Preencha matrícula e data de nascimento.");
      return;
    }

    try {
      setCarregando(true);

      const resposta = await api.post("/Auth/login", {
        matricula,
        dataNascimento,
      });

      localStorage.setItem("token", resposta.data.token);
      localStorage.setItem("usuario", JSON.stringify(resposta.data.usuario));

      alert("Login realizado com sucesso!");
    } catch {
      setErro("Matrícula ou data de nascimento inválida.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="login-pagina">
      <section className="login-conteudo">
        <header className="login-logo">
          <h1>SENAI</h1>
          <p>AUTOMOTIVO</p>
          <p>CAXIAS DO SUL</p>
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
            <label>Data de nascimento</label>

            <div className="campo-input">
              <FaCalendarAlt />
              <input
                type="date"
                value={dataNascimento}
                onChange={(e) => setDataNascimento(e.target.value)}
              />
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

        <div className="login-atalhos">
          <div>
            <FaClipboardList />
            <p>Demandas</p>
          </div>

          <div>
            <FaTools />
            <p>Checklists</p>
          </div>

          <div>
            <FaBoxOpen />
            <p>Almoxarifado</p>
          </div>

          <div>
            <FaChartBar />
            <p>Relatórios</p>
          </div>
        </div>

        <footer className="login-rodape">
          <p>SENAI Automotivo de Caxias do Sul</p>
          <span></span>
        </footer>
      </section>
    </main>
  );
}

export default Login;