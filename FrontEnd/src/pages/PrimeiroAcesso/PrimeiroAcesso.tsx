import { useState } from "react";
import { FaEnvelope, FaIdBadge, FaPhone, FaUser } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";

import { completarCadastro } from "../../services/auth";
import "../../styles/authFlow.css";

type PrimeiroAcessoState = {
  matricula?: string;
  dataNascimento?: string;
};

function PrimeiroAcesso() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state ?? {}) as PrimeiroAcessoState;

  const [matricula, setMatricula] = useState(state.matricula ?? "");
  const [dataNascimento, setDataNascimento] = useState(state.dataNascimento ?? "");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [setor, setSetor] = useState("");
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function salvarCadastro(evento: React.FormEvent) {
    evento.preventDefault();

    setErro("");

    if (!matricula || !dataNascimento || !email) {
      setErro("Preencha matricula, senha/data de nascimento e e-mail.");
      return;
    }

    try {
      setCarregando(true);

      await completarCadastro(
        matricula.trim(),
        dataNascimento.trim(),
        email.trim(),
        telefone.trim(),
        setor.trim(),
      );

      navigate("/dashboard");
    } catch {
      setErro("Nao foi possivel concluir o cadastro. Confira os dados e tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="auth-pagina">
      <form className="auth-card" onSubmit={salvarCadastro}>
        <header className="auth-logo">
          <h1>SENAI</h1>
          <p>AUTOMOTIVO</p>
          <p>CAXIAS DO SUL</p>
        </header>

        <div className="auth-icone">
          <FaIdBadge />
        </div>

        <h2>Complete seu cadastro</h2>

        <span className="auth-subtitulo">
          Informe seus dados de contato para ativar o acesso ao sistema.
        </span>

        <div className="auth-form">
          <div className="auth-grupo">
            <label>Matricula</label>
            <div className="auth-input">
              <FaUser />
              <input
                type="text"
                placeholder="Digite sua matricula"
                value={matricula}
                onChange={(evento) => setMatricula(evento.target.value)}
              />
            </div>
          </div>

          <div className="auth-grupo">
            <label>Senha / data de nascimento</label>
            <div className="auth-input">
              <FaIdBadge />
              <input
                type="password"
                placeholder="DDMMAAAA"
                value={dataNascimento}
                onChange={(evento) =>
                  setDataNascimento(evento.target.value.replace(/\D/g, ""))
                }
                maxLength={8}
              />
            </div>
          </div>

          <div className="auth-grupo">
            <label>E-mail</label>
            <div className="auth-input">
              <FaEnvelope />
              <input
                type="email"
                placeholder="seu.email@exemplo.com"
                value={email}
                onChange={(evento) => setEmail(evento.target.value)}
              />
            </div>
          </div>

          <div className="auth-grupo">
            <label>Telefone</label>
            <div className="auth-input">
              <FaPhone />
              <input
                type="tel"
                placeholder="Telefone para contato"
                value={telefone}
                onChange={(evento) => setTelefone(evento.target.value)}
              />
            </div>
          </div>

          <div className="auth-grupo">
            <label>Setor / area</label>
            <div className="auth-input">
              <FaIdBadge />
              <input
                type="text"
                placeholder="Ex.: Automotivo, Chassi, Pintura"
                value={setor}
                onChange={(evento) => setSetor(evento.target.value)}
              />
            </div>
          </div>

          {erro && <p className="auth-mensagem-erro">{erro}</p>}

          <button type="submit" className="auth-botao" disabled={carregando}>
            {carregando ? "Salvando..." : "Concluir cadastro"}
          </button>
        </div>
      </form>
    </main>
  );
}

export default PrimeiroAcesso;
