import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import {
  FiEdit2,
  FiMoreHorizontal,
  FiPlus,
  FiSave,
  FiSlash,
  FiTrash2,
  FiX,
} from "react-icons/fi";

import Header from "../../components/Header/Header";
import Sidebar from "../../components/Sidebar/Sidebar";
import { getUsuarioLogado } from "../../services/auth";
import { api } from "../../services/api";

import "./Usuarios.css";

type PerfilUsuario =
  | "Admin"
  | "Coordenador"
  | "Almoxarife"
  | "Almoxarifado"
  | "Professor";

type Usuario = {
  matricula: string;
  nome: string;
  perfil: PerfilUsuario;
  dataNascimento: string;
  ativo: boolean;
  email: string;
  telefone: string;
  setor: string;
};

type UsuarioApiResponse = {
  matricula?: string;
  Matricula?: string;
  nome?: string;
  Nome?: string;
  perfil?: PerfilUsuario;
  Perfil?: PerfilUsuario;
  dataNascimento?: string;
  DataNascimento?: string;
  ativo?: boolean;
  Ativo?: boolean;
  email?: string;
  Email?: string;
  telefone?: string;
  Telefone?: string;
  setor?: string;
  Setor?: string;
};

type UsuarioForm = {
  matricula: string;
  nome: string;
  perfil: PerfilUsuario;
  dataNascimento: string;
  ativo: boolean;
  email: string;
  telefone: string;
  setor: string;
};

const formularioVazio: UsuarioForm = {
  matricula: "",
  nome: "",
  perfil: "Professor",
  dataNascimento: "",
  ativo: true,
  email: "",
  telefone: "",
  setor: "",
};

function mapearUsuario(usuario: UsuarioApiResponse): Usuario {
  return {
    matricula: usuario.matricula ?? usuario.Matricula ?? "",
    nome: usuario.nome ?? usuario.Nome ?? "",
    perfil: usuario.perfil ?? usuario.Perfil ?? "Professor",
    dataNascimento: usuario.dataNascimento ?? usuario.DataNascimento ?? "",
    ativo: usuario.ativo ?? usuario.Ativo ?? true,
    email: usuario.email ?? usuario.Email ?? "",
    telefone: usuario.telefone ?? usuario.Telefone ?? "",
    setor: usuario.setor ?? usuario.Setor ?? "",
  };
}

function gerarIniciais(nome: string) {
  return nome
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0])
    .join("")
    .toUpperCase();
}

function formatarDataNascimento(data: string) {
  if (!/^\d{8}$/.test(data)) return data || "-";

  return `${data.slice(0, 2)}/${data.slice(2, 4)}/${data.slice(4)}`;
}

export default function Usuarios() {
  const usuarioLogado = getUsuarioLogado();

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [menuAberto, setMenuAberto] = useState<string | null>(null);
  const [modoModal, setModoModal] = useState<"criar" | "editar" | null>(null);
  const [matriculaOriginal, setMatriculaOriginal] = useState("");
  const [formulario, setFormulario] = useState<UsuarioForm>(formularioVazio);

  const carregarUsuarios = useCallback(async () => {
    setCarregando(true);
    setErro("");

    try {
      const response = await api.get<UsuarioApiResponse[]>("/usuarios");
      const usuariosReais = response.data.map(mapearUsuario);
      setUsuarios(usuariosReais);
    } catch {
      setErro("Nao foi possivel carregar os usuarios no momento.");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    let ativo = true;

    async function carregarInicial() {
      try {
        const response = await api.get<UsuarioApiResponse[]>("/usuarios");
        const usuariosReais = response.data.map(mapearUsuario);

        if (ativo) {
          setUsuarios(usuariosReais);
          setErro("");
        }
      } catch {
        if (ativo) {
          setErro("Nao foi possivel carregar os usuarios no momento.");
        }
      } finally {
        if (ativo) {
          setCarregando(false);
        }
      }
    }

    void carregarInicial();

    return () => {
      ativo = false;
    };
  }, []);

  const usuariosOrdenados = useMemo(() => {
    return [...usuarios].sort((a, b) => a.nome.localeCompare(b.nome));
  }, [usuarios]);

  function abrirCadastro() {
    setModoModal("criar");
    setMatriculaOriginal("");
    setFormulario(formularioVazio);
    setMenuAberto(null);
    setErro("");
  }

  function abrirEdicao(usuario: Usuario) {
    setModoModal("editar");
    setMatriculaOriginal(usuario.matricula);
    setFormulario({
      matricula: usuario.matricula,
      nome: usuario.nome,
      perfil: usuario.perfil,
      dataNascimento: usuario.dataNascimento,
      ativo: usuario.ativo,
      email: usuario.email,
      telefone: usuario.telefone,
      setor: usuario.setor,
    });
    setMenuAberto(null);
    setErro("");
  }

  function fecharModal() {
    setModoModal(null);
    setMatriculaOriginal("");
    setFormulario(formularioVazio);
    setSalvando(false);
  }

  function alterarCampo<K extends keyof UsuarioForm>(
    campo: K,
    valor: UsuarioForm[K],
  ) {
    setFormulario((estadoAtual) => ({
      ...estadoAtual,
      [campo]: valor,
    }));
  }

  async function salvarFormulario(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    const dados = {
      matricula: formulario.matricula.trim(),
      nome: formulario.nome.trim(),
      perfil: formulario.perfil,
      dataNascimento: formulario.dataNascimento.trim(),
      email: formulario.email.trim(),
      telefone: formulario.telefone.trim(),
      setor: formulario.setor.trim(),
    };

    setSalvando(true);
    setErro("");

    try {
      if (modoModal === "criar") {
        await api.post("/usuarios", dados);
      } else if (modoModal === "editar") {
        await api.put(`/usuarios/${encodeURIComponent(matriculaOriginal)}`, {
          nome: dados.nome,
          perfil: dados.perfil,
          dataNascimento: dados.dataNascimento,
          ativo: formulario.ativo,
          email: dados.email,
          telefone: dados.telefone,
          setor: dados.setor,
        });
      }

      await carregarUsuarios();
      fecharModal();
    } catch {
      setErro("Nao foi possivel salvar o usuario. Confira os dados e tente novamente.");
    } finally {
      setSalvando(false);
    }
  }

  async function inativarUsuario(usuario: Usuario) {
    if (usuarioLogado?.matricula === usuario.matricula) {
      window.alert("Voce nao pode inativar o proprio usuario logado.");
      return;
    }

    setMenuAberto(null);
    setErro("");

    try {
      await api.patch(`/usuarios/${encodeURIComponent(usuario.matricula)}/inativar`);
      await carregarUsuarios();
    } catch {
      setErro("Nao foi possivel inativar o usuario.");
    }
  }

  async function excluirUsuario(usuario: Usuario) {
    if (usuarioLogado?.matricula === usuario.matricula) {
      window.alert("Voce nao pode excluir o proprio usuario logado.");
      return;
    }

    const confirmar = window.confirm(
      `Tem certeza que deseja excluir ${usuario.nome}? Esta acao remove o usuario do sistema.`,
    );

    if (!confirmar) return;

    setMenuAberto(null);
    setErro("");

    try {
      await api.delete(`/usuarios/${encodeURIComponent(usuario.matricula)}`);
      await carregarUsuarios();
    } catch {
      setErro("Nao foi possivel excluir o usuario.");
    }
  }

  return (
    <div className="users-layout">
      <Sidebar />

      <main className="users-main">
        <Header titulo="" />

        <section className="users-conteudo">
          <header className="users-header">
            <div>
              <h1>Usuários</h1>
              <p>Gerencie os usuarios cadastrados no sistema.</p>
            </div>

            <button type="button" className="new-user-button" onClick={abrirCadastro}>
              <FiPlus />
              Novo usuario
            </button>
          </header>

          {erro && <div className="users-alert">{erro}</div>}

          <section className="users-card">
            <div className="users-table-wrapper">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Matricula</th>
                    <th>Perfil</th>
                    <th>Nascimento</th>
                    <th>Status</th>
                    <th>Acoes</th>
                  </tr>
                </thead>

                <tbody>
                  {carregando && (
                    <tr>
                      <td colSpan={6} className="users-empty">
                        Carregando usuarios...
                      </td>
                    </tr>
                  )}

                  {!carregando &&
                    usuariosOrdenados.map((usuario) => (
                      <tr key={usuario.matricula}>
                        <td>
                          <div className="user-info">
                            <div className="user-avatar">
                              {gerarIniciais(usuario.nome)}
                            </div>

                            <strong>{usuario.nome}</strong>
                          </div>
                        </td>

                        <td>
                          <span className="user-id">{usuario.matricula}</span>
                        </td>
                        <td>{usuario.perfil}</td>
                        <td>{formatarDataNascimento(usuario.dataNascimento)}</td>

                        <td>
                          <span
                            className={`user-status ${
                              usuario.ativo ? "active" : "inactive"
                            }`}
                          >
                            {usuario.ativo ? "Ativo" : "Inativo"}
                          </span>
                        </td>

                        <td>
                          <div className="user-actions">
                            <button
                              type="button"
                              title="Editar usuario"
                              onClick={() => abrirEdicao(usuario)}
                            >
                              <FiEdit2 />
                            </button>

                            <div className="user-more-wrapper">
                              <button
                                type="button"
                                title="Mais acoes"
                                onClick={() =>
                                  setMenuAberto((estadoAtual) =>
                                    estadoAtual === usuario.matricula
                                      ? null
                                      : usuario.matricula,
                                  )
                                }
                              >
                                <FiMoreHorizontal />
                              </button>

                              {menuAberto === usuario.matricula && (
                                <div className="user-more-menu">
                                  <button
                                    type="button"
                                    onClick={() => inativarUsuario(usuario)}
                                    disabled={
                                      !usuario.ativo ||
                                      usuarioLogado?.matricula === usuario.matricula
                                    }
                                  >
                                    <FiSlash />
                                    Inativar
                                  </button>

                                  <button
                                    type="button"
                                    className="danger"
                                    onClick={() => excluirUsuario(usuario)}
                                    disabled={
                                      usuarioLogado?.matricula === usuario.matricula
                                    }
                                  >
                                    <FiTrash2 />
                                    Excluir
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}

                  {!carregando && usuariosOrdenados.length === 0 && (
                    <tr>
                      <td colSpan={6} className="users-empty">
                        Nenhum usuario cadastrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="users-footer">
              <span>
                Exibindo {usuariosOrdenados.length > 0 ? 1 : 0} a{" "}
                {usuariosOrdenados.length} de {usuariosOrdenados.length} usuarios
              </span>

              <div className="pagination">
                <button type="button" disabled>
                  &lt;
                </button>
                <button type="button" className="active">
                  1
                </button>
                <button type="button" disabled>
                  &gt;
                </button>
              </div>
            </div>
          </section>
        </section>
      </main>

      {modoModal && (
        <div className="user-modal-fundo" onClick={fecharModal}>
          <aside
            className="user-modal"
            onClick={(evento) => evento.stopPropagation()}
          >
            <header className="user-modal-topo">
              <div>
                <h2>{modoModal === "criar" ? "Novo usuario" : "Editar usuario"}</h2>
                <p>
                  {modoModal === "criar"
                    ? "Cadastre um usuario no sistema."
                    : "Atualize as informacoes do usuario."}
                </p>
              </div>

              <button type="button" onClick={fecharModal}>
                <FiX />
              </button>
            </header>

            <form className="user-form" onSubmit={salvarFormulario}>
              <label>
                Matricula
                <input
                  type="text"
                  value={formulario.matricula}
                  onChange={(evento) => alterarCampo("matricula", evento.target.value)}
                  disabled={modoModal === "editar"}
                  required
                />
              </label>

              <label>
                Nome
                <input
                  type="text"
                  value={formulario.nome}
                  onChange={(evento) => alterarCampo("nome", evento.target.value)}
                  required
                />
              </label>

              <label>
                Data de nascimento
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="\d{8}"
                  maxLength={8}
                  placeholder="DDMMAAAA"
                  value={formulario.dataNascimento}
                  onChange={(evento) =>
                    alterarCampo(
                      "dataNascimento",
                      evento.target.value.replace(/\D/g, ""),
                    )
                  }
                  required
                />
                <small>Use 8 digitos, por exemplo 01012000.</small>
              </label>

              <label>
                Perfil
                <select
                  value={formulario.perfil}
                  onChange={(evento) =>
                    alterarCampo("perfil", evento.target.value as PerfilUsuario)
                  }
                >
                  <option value="Admin">Admin</option>
                  <option value="Coordenador">Coordenador</option>
                  <option value="Almoxarifado">Almoxarifado</option>
                  <option value="Professor">Professor</option>
                </select>
              </label>

              <label>
                E-mail
                <input
                  type="email"
                  value={formulario.email}
                  onChange={(evento) => alterarCampo("email", evento.target.value)}
                  placeholder="Opcional no cadastro inicial"
                />
              </label>

              <label>
                Telefone
                <input
                  type="tel"
                  value={formulario.telefone}
                  onChange={(evento) => alterarCampo("telefone", evento.target.value)}
                  placeholder="Opcional"
                />
              </label>

              <label>
                Setor / area
                <input
                  type="text"
                  value={formulario.setor}
                  onChange={(evento) => alterarCampo("setor", evento.target.value)}
                  placeholder="Opcional"
                />
              </label>

              {modoModal === "editar" && (
                <label>
                  Status
                  <select
                    value={formulario.ativo ? "Ativo" : "Inativo"}
                    onChange={(evento) =>
                      alterarCampo("ativo", evento.target.value === "Ativo")
                    }
                  >
                    <option value="Ativo">Ativo</option>
                    <option value="Inativo">Inativo</option>
                  </select>
                </label>
              )}

              <div className="user-form-acoes">
                <button type="button" className="cancelar" onClick={fecharModal}>
                  Cancelar
                </button>

                <button type="submit" className="salvar" disabled={salvando}>
                  <FiSave />
                  {salvando ? "Salvando..." : "Salvar"}
                </button>
              </div>
            </form>
          </aside>
        </div>
      )}
    </div>
  );
}
