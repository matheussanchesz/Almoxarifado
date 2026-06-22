import { FiEdit2, FiMoreHorizontal, FiPlus } from "react-icons/fi";

import Sidebar from "../../components/Sidebar/Sidebar";

import "./Usuarios.css";

const users = [
    {
        name: "João Pedro",
        email: "joao.pedro@senai.br",
        role: "Coordenador",
        status: "Ativo",
    },
    {
        name: "Evellyn Maia",
        email: "evellyn.maia@senai.br",
        role: "Almoxarife",
        status: "Ativo",
    },
    {
        name: "Lucas Silva",
        email: "lucas.silva@senai.br",
        role: "Professor",
        status: "Ativo",
    },
    {
        name: "Mariano Costa",
        email: "mariano.costa@senai.br",
        role: "Professor",
        status: "Ativo",
    },
    {
        name: "Carlos Eduardo",
        email: "carlos.eduardo@senai.br",
        role: "Professor",
        status: "Inativo",
    },
];

export default function Usuarios() {
    return (
        <div className="users-layout">
            <Sidebar />

            <main className="users-main">
                <div className="users-header">
                    <div>
                        <h1>Usuários</h1>
                        <p>
                            Usuários <span>›</span> Lista
                        </p>
                    </div>

                    <button className="new-user-button">
                        <FiPlus />
                        Novo Usuário
                    </button>
                </div>

                <section className="users-card">
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
                            {users.map((user) => (
                                <tr key={user.email}>
                                    <td>
                                        <div className="user-info">
                                            <div className="user-avatar">
                                                {user.name
                                                    .split(" ")
                                                    .map((name) => name[0])
                                                    .join("")
                                                    .slice(0, 2)}
                                            </div>

                                            <strong>{user.name}</strong>
                                        </div>
                                    </td>

                                    <td>{user.email}</td>
                                    <td>{user.role}</td>

                                    <td>
                                        <span
                                            className={`user-status ${user.status === "Ativo" ? "active" : "inactive"
                                                }`}
                                        >
                                            {user.status}
                                        </span>
                                    </td>

                                    <td>
                                        <div className="user-actions">
                                            <button>
                                                <FiEdit2 />
                                            </button>

                                            <button>
                                                <FiMoreHorizontal />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div className="users-footer">
                        <span>Exibindo 1 a 5 de 15 usuários</span>

                        <div className="pagination">
                            <button type="button">&lt;</button>
                            <button type="button" className="active">1</button>
                            <button type="button">2</button>
                            <button type="button">3</button>
                            <button type="button">&gt;</button>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}