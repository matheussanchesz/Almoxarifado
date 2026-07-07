import { useState } from "react";
import {
  FiEdit2,
  FiMoreHorizontal,
  FiSave,
  FiSlash,
  FiTrash2,
  FiX,
} from "react-icons/fi";

import Sidebar from "../../components/Sidebar/Sidebar";
import Header from "../../components/Header/Header";

import "./Usuarios.css";

type StatusUsuario = "Ativo" | "Inativo";
type PerfilUsuario = "Admin" | "Coordenador" | "Almoxarife" | "Professor";

type Usuario = {
  id: string;
  nome: string;
  email: string;
  perfil: PerfilUsuario;
  status: StatusUsuario;
};

const usuariosMock: Usuario[] = [
  {
    id: "USR-001",
    nome: "João Pedro",
    email: "joao.pedro@senai.br",
    perfil: "Coordenador",
    status: "Ativo",
  },
  {
    id: "USR-002",
    nome: "Evellyn Maia",
    email: "evellyn.maia@senai.br",
    perfil: "Almoxarife",
    status: "Ativo",
  },
  {
    id: "USR-003",
    nome: "Lucas Silva",
    email: "lucas.silva@senai.br",
    perfil: "Professor",
    status: "Ativo",
  },
  {
    id: "USR-004",
    nome: "Mariano Costa",
    email: "mariano.costa@senai.br",
    perfil: "Professor",
    status: "Ativo",
  },
  {
    id: "USR-005",
    nome: "Carlos Eduardo",
    email: "carlos.eduardo@senai.br",
    perfil: "Professor",
    status: "Inativo",
  },
];

function gerarIniciais(nome: string) {
  return nome
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0])
    .join("")
    .toUpperCase();
}

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>(usuariosMock);
  const [usuarioEditando, setUsuarioEditando] = useState<Usuario | null>(null);
  const [menuAberto, setMenuAberto] = useState<string | null>(null);

  function abrirEdicao(usuario: Usuario) {
    setUsuarioEditando(usuario);
    setMenuAberto(null);
  }

  function fecharEdicao() {
    setUsuarioEditando(null);
  }

  function salvarEdicao(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    if (!usuarioEditando) return;

    setUsuarios((estadoAtual) =>
      estadoAtual.map((usuario) =>
        usuario.id === usuarioEditando.id ? usuarioEditando : usuario,
      ),
    );

    setUsuarioEditando(null);

    /*
      Futuramente, trocar por API:
      await api.put(`/usuarios/${usuarioEditando.id}`, usuarioEditando);
    */
  }

  function inativarUsuario(id: string) {
    setUsuarios((estadoAtual) =>
      estadoAtual.map((usuario) =>
        usuario.id === id ? { ...usuario, status: "Inativo" } : usuario,
      ),
    );

    setMenuAberto(null);

    /*
      Futuramente, trocar por API:
      await api.patch(`/usuarios/${id}/inativar`);
    */
  }

  function excluirUsuario(id: string) {
    const confirmar = window.confirm(
      "Tem certeza que deseja excluir este usuário?",
    );

    if (!confirmar) return;

    setUsuarios((estadoAtual) =>
      estadoAtual.filter((usuario) => usuario.id !== id),
    );

    setMenuAberto(null);

    /*
      Futuramente, trocar por API:
      await api.delete(`/usuarios/${id}`);
    */
  }

  return (
    <div className="users-layout">
      <Sidebar />

      <main className="users-main">
        <Header />

        <section className="users-conteudo">
          <header className="users-header">
            <div>
              <h1>Usuários</h1>
              <p>Gerencie perfis, permissões e status dos usuários.</p>
            </div>


          </header>

          <section className="users-card">
            <div className="users-table-wrapper">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>E-mail</th>
                    <th>Perfil</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>

                <tbody>
                  {usuarios.map((usuario) => (
                    <tr key={usuario.id}>
                      <td>
                        <div className="user-info">
                          <div className="user-avatar">
                            {gerarIniciais(usuario.nome)}
                          </div>

                          <strong>{usuario.nome}</strong>
                        </div>
                      </td>

                      <td>{usuario.email}</td>
                      <td>{usuario.perfil}</td>

                      <td>
                        <span
                          className={`user-status ${
                            usuario.status === "Ativo" ? "active" : "inactive"
                          }`}
                        >
                          {usuario.status}
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
                                  estadoAtual === usuario.id
                                    ? null
                                    : usuario.id,
                                )
                              }
                            >
                              <FiMoreHorizontal />
                            </button>

                            {menuAberto === usuario.id && (
                              <div className="user-more-menu">
                                <button
                                  type="button"
                                  onClick={() => inativarUsuario(usuario.id)}
                                  disabled={usuario.status === "Inativo"}
                                >
                                  <FiSlash />
                                  Inativar
                                </button>

                                <button
                                  type="button"
                                  className="danger"
                                  onClick={() => excluirUsuario(usuario.id)}
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

                  {usuarios.length === 0 && (
                    <tr>
                      <td colSpan={5} className="users-empty">
                        Nenhum usuário cadastrado.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="users-footer">
              <span>
                Exibindo {usuarios.length > 0 ? 1 : 0} a {usuarios.length} de{" "}
                {usuarios.length} usuários
              </span>

              <div className="pagination">
                <button type="button">&lt;</button>
                <button type="button" className="active">
                  1
                </button>
                <button type="button">&gt;</button>
              </div>
            </div>
          </section>
        </section>
      </main>

      {usuarioEditando && (
        <div className="user-modal-fundo" onClick={fecharEdicao}>
          <aside
            className="user-modal"
            onClick={(evento) => evento.stopPropagation()}
          >
            <header className="user-modal-topo">
              <div>
                <h2>Editar usuário</h2>
                <p>Atualize as informações principais do usuário.</p>
              </div>

              <button type="button" onClick={fecharEdicao}>
                <FiX />
              </button>
            </header>

            <form className="user-form" onSubmit={salvarEdicao}>
              <label>
                Nome
                <input
                  type="text"
                  value={usuarioEditando.nome}
                  onChange={(evento) =>
                    setUsuarioEditando({
                      ...usuarioEditando,
                      nome: evento.target.value,
                    })
                  }
                  required
                />
              </label>

              <label>
                E-mail
                <input
                  type="email"
                  value={usuarioEditando.email}
                  onChange={(evento) =>
                    setUsuarioEditando({
                      ...usuarioEditando,
                      email: evento.target.value,
                    })
                  }
                  required
                />
              </label>

              <label>
                Perfil
                <select
                  value={usuarioEditando.perfil}
                  onChange={(evento) =>
                    setUsuarioEditando({
                      ...usuarioEditando,
                      perfil: evento.target.value as PerfilUsuario,
                    })
                  }
                >
                  <option value="Admin">Admin</option>
                  <option value="Coordenador">Coordenador</option>
                  <option value="Almoxarife">Almoxarife</option>
                  <option value="Professor">Professor</option>
                </select>
              </label>

              <label>
                Status
                <select
                  value={usuarioEditando.status}
                  onChange={(evento) =>
                    setUsuarioEditando({
                      ...usuarioEditando,
                      status: evento.target.value as StatusUsuario,
                    })
                  }
                >
                  <option value="Ativo">Ativo</option>
                  <option value="Inativo">Inativo</option>
                </select>
              </label>

              <div className="user-form-acoes">
                <button type="button" className="cancelar" onClick={fecharEdicao}>
                  Cancelar
                </button>

                <button type="submit" className="salvar">
                  <FiSave />
                  Salvar alterações
                </button>
              </div>
            </form>
          </aside>
        </div>
      )}
    </div>
  );
}
