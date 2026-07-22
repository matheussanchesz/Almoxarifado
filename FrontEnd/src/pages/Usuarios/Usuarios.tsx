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
  | "Desenvolvedor"
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
};

type UsuarioForm = {
  matricula: string;
  nome: string;
  perfil: PerfilUsuario;
  dataNascimento: string;
  ativo: boolean;
};

const formularioVazio: UsuarioForm = {
  matricula: "",
  nome: "",
  perfil: "Professor",
  dataNascimento: "",
  ativo: true,
};

function mapearUsuario(usuario: UsuarioApiResponse): Usuario {
  return {
    matricula: usuario.matricula ?? usuario.Matricula ?? "",
    nome: usuario.nome ?? usuario.Nome ?? "",
    perfil: usuario.perfil ?? usuario.Perfil ?? "Professor",
    dataNascimento: usuario.dataNascimento ?? usuario.DataNascimento ?? "",
    ativo: usuario.ativo ?? usuario.Ativo ?? true,
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
      const usuariosReais = response.data
        .map(mapearUsuario)
        .filter(
          (usuario) =>
            usuarioLogado?.perfil !== "Coordenador" ||
            usuario.perfil !== "Desenvolvedor",
        );
      setUsuarios(usuariosReais);
    } catch {
      setErro("Não foi possível carregar os usuários no momento.");
    } finally {
      setCarregando(false);
    }
  }, [usuarioLogado?.perfil]);

  useEffect(() => {
    let ativo = true;

    async function carregarInicial() {
      try {
        const response = await api.get<UsuarioApiResponse[]>("/usuarios");
        const usuariosReais = response.data
          .map(mapearUsuario)
          .filter(
            (usuario) =>
              usuarioLogado?.perfil !== "Coordenador" ||
              usuario.perfil !== "Desenvolvedor",
          );

        if (ativo) {
          setUsuarios(usuariosReais);
          setErro("");
        }
      } catch {
        if (ativo) {
      setErro("Não foi possível carregar os usuários no momento.");
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
  }, [usuarioLogado?.perfil]);

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
        });
      }

      await carregarUsuarios();
      fecharModal();
    } catch {
      setErro("Não foi possível salvar o usuário. Confira os dados e tente novamente.");
    } finally {
      setSalvando(false);
    }
  }

  async function inativarUsuario(usuario: Usuario) {
    if (usuarioLogado?.matricula === usuario.matricula) {
      window.alert("Você não pode inativar o próprio usuário conectado.");
      return;
    }

    setMenuAberto(null);
    setErro("");

    try {
      await api.patch(`/usuarios/${encodeURIComponent(usuario.matricula)}/inativar`);
      await carregarUsuarios();
    } catch {
      setErro("Não foi possível inativar o usuário.");
    }
  }

  async function excluirUsuario(usuario: Usuario) {
    if (usuarioLogado?.matricula === usuario.matricula) {
      window.alert("Você não pode excluir o próprio usuário conectado.");
      return;
    }

    const confirmar = window.confirm(
      `Tem certeza de que deseja excluir ${usuario.nome}? Esta ação remove o usuário do sistema.`,
    );

    if (!confirmar) return;

    setMenuAberto(null);
    setErro("");

    try {
      await api.delete(`/usuarios/${encodeURIComponent(usuario.matricula)}`);
      await carregarUsuarios();
    } catch {
      setErro("Não foi possível excluir o usuário.");
    }
  }

  return (
    <div className="users-layout">
      <Sidebar />

      <main className="users-main">
        <Header titulo="Usuários" />

        <section className="users-conteudo">
          <header className="users-header">
            <div>
              <p>Gerencie os usuários cadastrados no sistema.</p>
            </div>

            <button type="button" className="new-user-button" onClick={abrirCadastro}>
              <FiPlus />
              Novo usuário
            </button>
          </header>

          {erro && <div className="users-alert">{erro}</div>}

          <section className="users-card">
            <div className="users-table-wrapper">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Nome</th>
                <th>Matrícula</th>
                    <th>Perfil</th>
                    <th>Nascimento</th>
                    <th>Status</th>
                <th>Ações</th>
                  </tr>
                </thead>

                <tbody>
                  {carregando && (
                    <tr>
                      <td colSpan={6} className="users-empty">
                    Carregando usuários...
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
                          title="Editar usuário"
                              onClick={() => abrirEdicao(usuario)}
                            >
                              <FiEdit2 />
                            </button>

                            <div className="user-more-wrapper">
                              <button
                                type="button"
                          title="Mais ações"
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
                    Nenhum usuário cadastrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="users-footer">
              <span>
                Exibindo {usuariosOrdenados.length > 0 ? 1 : 0} a{" "}
          {usuariosOrdenados.length} de {usuariosOrdenados.length} usuários
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
              <h2>{modoModal === "criar" ? "Novo usuário" : "Editar usuário"}</h2>
                <p>
                  {modoModal === "criar"
                  ? "Cadastre um usuário no sistema."
                  : "Atualize as informações do usuário."}
                </p>
              </div>

              <button type="button" onClick={fecharModal}>
                <FiX />
              </button>
            </header>

            <form className="user-form" onSubmit={salvarFormulario}>
              <label>
                Matrícula
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
                  <option value="Coordenador">Coordenador</option>
                  <option value="Almoxarife">Almoxarife</option>
                  <option value="Professor">Professor</option>
                </select>
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
