using Google.Cloud.Firestore;
using AlmoxarifadoSenai.Api.Models;
using System.Collections.Generic;
using System.Threading.Tasks;
using System;
using System.Linq;

namespace AlmoxarifadoSenai.Api.Services
{
    public class FirestoreService
    {
        private readonly FirestoreDb _db;
        private const string ColecaoUsuarios = "usuarios";

        public FirestoreService(IConfiguration configuration)
        {
            var projectId = configuration["Firebase:ProjectId"];

            if (string.IsNullOrWhiteSpace(projectId))
            {
                throw new InvalidOperationException("Configure Firebase__ProjectId antes de iniciar a API.");
            }

            _db = FirestoreDb.Create(projectId);
        }

        public FirestoreDb GetDatabase()
        {
            return _db;
        }

        // 1. Cria ou Atualiza Usuário
        public async Task SalvarUsuarioAsync(Usuario usuario)
        {
            DocumentReference docRef = _db.Collection(ColecaoUsuarios).Document(usuario.Matricula);
            await docRef.SetAsync(usuario, SetOptions.Overwrite);
        }

        // 2. Busca Usuário por Matrícula
        public async Task DeletarUsuarioAsync(string matricula)
        {
            DocumentReference docRef = _db.Collection(ColecaoUsuarios).Document(matricula);
            await docRef.DeleteAsync();
        }

        public async Task<Usuario?> ObterUsuarioPorMatriculaAsync(string matricula)
        {
            Console.WriteLine($"🔍 Buscando usuário: '{matricula}'");

            DocumentReference docRef = _db.Collection(ColecaoUsuarios).Document(matricula);
            DocumentSnapshot snapshot = await docRef.GetSnapshotAsync();

            if (snapshot.Exists)
            {
                try
                {
                    var data = snapshot.ToDictionary();

                    var usuario = new Usuario();

                    if (data.ContainsKey("matricula"))
                        usuario.Matricula = data["matricula"]?.ToString() ?? "";
                    else if (data.ContainsKey("Matricula"))
                        usuario.Matricula = data["Matricula"]?.ToString() ?? "";
                    else
                        usuario.Matricula = matricula;

                    if (data.ContainsKey("nome"))
                        usuario.Nome = data["nome"]?.ToString() ?? "";
                    else if (data.ContainsKey("Nome"))
                        usuario.Nome = data["Nome"]?.ToString() ?? "";

                    if (data.ContainsKey("perfil"))
                        usuario.Perfil = data["perfil"]?.ToString() ?? "";
                    else if (data.ContainsKey("Perfil"))
                        usuario.Perfil = data["Perfil"]?.ToString() ?? "";

                    if (data.ContainsKey("ativo"))
                        usuario.Ativo = Convert.ToBoolean(data["ativo"]);
                    else if (data.ContainsKey("Ativo"))
                        usuario.Ativo = Convert.ToBoolean(data["Ativo"]);
                    else
                        usuario.Ativo = true;

                    if (data.ContainsKey("email"))
                        usuario.Email = data["email"]?.ToString() ?? "";
                    else if (data.ContainsKey("Email"))
                        usuario.Email = data["Email"]?.ToString() ?? "";

                    if (data.ContainsKey("telefone"))
                        usuario.Telefone = data["telefone"]?.ToString() ?? "";
                    else if (data.ContainsKey("Telefone"))
                        usuario.Telefone = data["Telefone"]?.ToString() ?? "";

                    if (data.ContainsKey("setor"))
                        usuario.Setor = data["setor"]?.ToString() ?? "";
                    else if (data.ContainsKey("Setor"))
                        usuario.Setor = data["Setor"]?.ToString() ?? "";

                    if (data.ContainsKey("primeiroAcesso"))
                        usuario.PrimeiroAcesso = Convert.ToBoolean(data["primeiroAcesso"]);
                    else if (data.ContainsKey("PrimeiroAcesso"))
                        usuario.PrimeiroAcesso = Convert.ToBoolean(data["PrimeiroAcesso"]);
                    else
                        usuario.PrimeiroAcesso = string.IsNullOrWhiteSpace(usuario.Email);

                    if (data.ContainsKey("dataNascimento") && data["dataNascimento"] != null)
                    {
                        var valor = data["dataNascimento"];
                        if (valor is Timestamp ts)
                            usuario.DataNascimento = ts.ToDateTime().ToString("ddMMyyyy");
                        else if (valor is DateTime dt)
                            usuario.DataNascimento = dt.ToString("ddMMyyyy");
                        else
                            usuario.DataNascimento = valor.ToString() ?? "";
                    }
                    else if (data.ContainsKey("DataNascimento") && data["DataNascimento"] != null)
                    {
                        var valor = data["DataNascimento"];
                        if (valor is Timestamp ts)
                            usuario.DataNascimento = ts.ToDateTime().ToString("ddMMyyyy");
                        else if (valor is DateTime dt)
                            usuario.DataNascimento = dt.ToString("ddMMyyyy");
                        else
                            usuario.DataNascimento = valor.ToString() ?? "";
                    }

                    Console.WriteLine($"✅ Usuário encontrado: {usuario.Nome} ({usuario.Matricula})");
                    return usuario;
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"❌ Erro ao converter: {ex.Message}");
                    return null;
                }
            }

            Console.WriteLine($"❌ Usuário '{matricula}' não encontrado");
            return null;
        }

        // 3. Busca TODOS os Usuários (APENAS ESTE MÉTODO!)
        public async Task<List<Usuario>> ObterTodosUsuariosAsync()
        {
            Console.WriteLine("========================================");
            Console.WriteLine("🔍 BUSCANDO TODOS OS USUÁRIOS");

            Query query = _db.Collection(ColecaoUsuarios);
            QuerySnapshot snapshot = await query.GetSnapshotAsync();

            Console.WriteLine($"📄 Total de documentos encontrados: {snapshot.Documents.Count}");

            var usuarios = new List<Usuario>();

            foreach (DocumentSnapshot document in snapshot.Documents)
            {
                Console.WriteLine($"----------------------------------------");
                Console.WriteLine($"📄 Documento ID: {document.Id}");

                if (document.Exists)
                {
                    try
                    {
                        var data = document.ToDictionary();

                        Console.WriteLine($"📋 Campos encontrados: {string.Join(", ", data.Keys)}");

                        foreach (var kvp in data)
                        {
                            Console.WriteLine($"   - {kvp.Key}: {kvp.Value} (Tipo: {kvp.Value?.GetType().Name ?? "null"})");
                        }

                        var usuario = new Usuario();

                        if (data.ContainsKey("matricula"))
                            usuario.Matricula = data["matricula"]?.ToString() ?? "";
                        else if (data.ContainsKey("Matricula"))
                            usuario.Matricula = data["Matricula"]?.ToString() ?? "";
                        else
                            usuario.Matricula = document.Id;

                        if (data.ContainsKey("nome"))
                            usuario.Nome = data["nome"]?.ToString() ?? "";
                        else if (data.ContainsKey("Nome"))
                            usuario.Nome = data["Nome"]?.ToString() ?? "";

                        if (data.ContainsKey("perfil"))
                            usuario.Perfil = data["perfil"]?.ToString() ?? "";
                        else if (data.ContainsKey("Perfil"))
                            usuario.Perfil = data["Perfil"]?.ToString() ?? "";

                        if (data.ContainsKey("ativo"))
                            usuario.Ativo = Convert.ToBoolean(data["ativo"]);
                        else if (data.ContainsKey("Ativo"))
                            usuario.Ativo = Convert.ToBoolean(data["Ativo"]);
                        else
                            usuario.Ativo = true;

                        if (data.ContainsKey("email"))
                            usuario.Email = data["email"]?.ToString() ?? "";
                        else if (data.ContainsKey("Email"))
                            usuario.Email = data["Email"]?.ToString() ?? "";

                        if (data.ContainsKey("telefone"))
                            usuario.Telefone = data["telefone"]?.ToString() ?? "";
                        else if (data.ContainsKey("Telefone"))
                            usuario.Telefone = data["Telefone"]?.ToString() ?? "";

                        if (data.ContainsKey("setor"))
                            usuario.Setor = data["setor"]?.ToString() ?? "";
                        else if (data.ContainsKey("Setor"))
                            usuario.Setor = data["Setor"]?.ToString() ?? "";

                        if (data.ContainsKey("primeiroAcesso"))
                            usuario.PrimeiroAcesso = Convert.ToBoolean(data["primeiroAcesso"]);
                        else if (data.ContainsKey("PrimeiroAcesso"))
                            usuario.PrimeiroAcesso = Convert.ToBoolean(data["PrimeiroAcesso"]);
                        else
                            usuario.PrimeiroAcesso = string.IsNullOrWhiteSpace(usuario.Email);

                        if (data.ContainsKey("dataNascimento") && data["dataNascimento"] != null)
                        {
                            var valor = data["dataNascimento"];
                            if (valor is Timestamp ts)
                                usuario.DataNascimento = ts.ToDateTime().ToString("ddMMyyyy");
                            else if (valor is DateTime dt)
                                usuario.DataNascimento = dt.ToString("ddMMyyyy");
                            else
                                usuario.DataNascimento = valor.ToString() ?? "";
                        }
                        else if (data.ContainsKey("DataNascimento") && data["DataNascimento"] != null)
                        {
                            var valor = data["DataNascimento"];
                            if (valor is Timestamp ts)
                                usuario.DataNascimento = ts.ToDateTime().ToString("ddMMyyyy");
                            else if (valor is DateTime dt)
                                usuario.DataNascimento = dt.ToString("ddMMyyyy");
                            else
                                usuario.DataNascimento = valor.ToString() ?? "";
                        }

                        Console.WriteLine($"✅ Usuário convertido:");
                        Console.WriteLine($"   - Matricula: '{usuario.Matricula}'");
                        Console.WriteLine($"   - Nome: '{usuario.Nome}'");
                        Console.WriteLine($"   - Perfil: '{usuario.Perfil}'");
                        Console.WriteLine($"   - DataNascimento: '{usuario.DataNascimento}'");
                        Console.WriteLine($"   - Ativo: {usuario.Ativo}");

                        usuarios.Add(usuario);
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine($"❌ Erro ao converter documento {document.Id}: {ex.Message}");
                    }
                }
                else
                {
                    Console.WriteLine($"❌ Documento {document.Id} não existe");
                }
            }

            Console.WriteLine($"✅ Total de usuários convertidos: {usuarios.Count}");
            Console.WriteLine("========================================");

            return usuarios;
        }

        public async Task<Usuario?> ObterUsuarioPorEmailAsync(string email)
        {
            if (string.IsNullOrWhiteSpace(email))
            {
                return null;
            }

            var usuarios = await ObterTodosUsuariosAsync();
            return usuarios.FirstOrDefault(usuario =>
                !string.IsNullOrWhiteSpace(usuario.Email) &&
                string.Equals(usuario.Email.Trim(), email.Trim(), StringComparison.OrdinalIgnoreCase));
        }

        // --- MÉTODOS DA SPRINT 3: DEMANDAS ---

        // 1. Salvar ou Atualizar Demanda
        public async Task SalvarDemandaAsync(Demanda demanda)
        {
            if (string.IsNullOrEmpty(demanda.Id))
            {
                demanda.Id = Guid.NewGuid().ToString();
            }

            var docRef = _db.Collection("demandas").Document(demanda.Id);
            await docRef.SetAsync(demanda, SetOptions.Overwrite);
        }

        // 2. Obter Demanda por ID específico
        public async Task<Demanda?> ObterDemandaPorIdAsync(string id)
        {
            var docRef = _db.Collection("demandas").Document(id);
            var snapshot = await docRef.GetSnapshotAsync();

            if (!snapshot.Exists) return null;

            return snapshot.ConvertTo<Demanda>();
        }

        // 3. Obter TODAS as demandas cadastradas
        public async Task<List<Demanda>> ObterTodasDemandasAsync()
        {
            var query = _db.Collection("demandas").OrderByDescending("DataHoraCriacao");
            var snapshot = await query.GetSnapshotAsync();

            var lista = new List<Demanda>();
            foreach (var doc in snapshot.Documents)
            {
                if (doc.Exists)
                {
                    lista.Add(doc.ConvertTo<Demanda>());
                }
            }
            return lista;
        }

        // 4. Obter demandas de um Professor específico
        public async Task<List<Demanda>> ObterDemandasPorProfessorAsync(string professorMatricula)
        {
            var query = _db.Collection("demandas")
                           .WhereEqualTo("ProfessorMatricula", professorMatricula);

            var snapshot = await query.GetSnapshotAsync();

            var lista = new List<Demanda>();
            foreach (var doc in snapshot.Documents)
            {
                if (doc.Exists)
                {
                    lista.Add(doc.ConvertTo<Demanda>());
                }
            }
            return lista.OrderByDescending(d => d.DataHoraCriacao).ToList();
        }

        // 5. Deletar Demanda
        public async Task DeletarDemandaAsync(string id)
        {
            var docRef = _db.Collection("demandas").Document(id);
            await docRef.DeleteAsync();
        }

        // --- MÉTODOS DO SPRINT 4: CHECKLISTS ---

        // 1. Salvar Checklist
        public async Task SalvarChecklistAsync(Checklist checklist)
        {
            if (string.IsNullOrEmpty(checklist.Id))
            {
                checklist.Id = Guid.NewGuid().ToString();
            }
            var docRef = _db.Collection("checklists").Document(checklist.Id);
            await docRef.SetAsync(checklist, SetOptions.Overwrite);
        }

        // 2. Obter Checklist por ID
        public async Task<Checklist?> ObterChecklistPorIdAsync(string id)
        {
            var docRef = _db.Collection("checklists").Document(id);
            var snapshot = await docRef.GetSnapshotAsync();
            if (!snapshot.Exists) return null;
            return snapshot.ConvertTo<Checklist>();
        }

        // 3. Obter Todos Checklists
        public async Task<List<Checklist>> ObterTodosChecklistsAsync()
        {
            var query = _db.Collection("checklists").OrderByDescending("DataCriacao");
            var snapshot = await query.GetSnapshotAsync();
            var lista = new List<Checklist>();
            foreach (var doc in snapshot.Documents)
            {
                if (doc.Exists)
                {
                    lista.Add(doc.ConvertTo<Checklist>());
                }
            }
            return lista;
        }

        // 4. Deletar Checklist
        public async Task DeletarChecklistAsync(string id)
        {
            var docRef = _db.Collection("checklists").Document(id);
            await docRef.DeleteAsync();
        }

        // 5. Salvar Execução de Checklist
        public async Task SalvarExecucaoChecklistAsync(ExecucaoChecklist execucao)
        {
            if (string.IsNullOrEmpty(execucao.Id))
            {
                execucao.Id = Guid.NewGuid().ToString();
            }
            var docRef = _db.Collection("execucoes_checklist").Document(execucao.Id);
            await docRef.SetAsync(execucao, SetOptions.Overwrite);
        }

        // 6. Obter Todas Execuções de Checklist
        public async Task<List<ExecucaoChecklist>> ObterTodasExecucoesChecklistAsync()
        {
            var query = _db.Collection("execucoes_checklist").OrderByDescending("DataExecucao");
            var snapshot = await query.GetSnapshotAsync();
            var lista = new List<ExecucaoChecklist>();
            foreach (var doc in snapshot.Documents)
            {
                if (doc.Exists)
                {
                    lista.Add(doc.ConvertTo<ExecucaoChecklist>());
                }
            }
            return lista;
        }

        // --- MÉTODOS DO SPRINT 4: SOLICITAÇÃO DE COMPRAS ---

        // 7. Salvar Solicitação de Compra
        public async Task SalvarSolicitacaoCompraAsync(SolicitacaoCompra solicitacao)
        {
            if (string.IsNullOrEmpty(solicitacao.Id))
            {
                solicitacao.Id = Guid.NewGuid().ToString();
            }
            var docRef = _db.Collection("solicitacoes_compra").Document(solicitacao.Id);
            await docRef.SetAsync(solicitacao, SetOptions.Overwrite);
        }

        // 8. Obter Solicitação de Compra por ID
        public async Task<SolicitacaoCompra?> ObterSolicitacaoCompraPorIdAsync(string id)
        {
            var docRef = _db.Collection("solicitacoes_compra").Document(id);
            var snapshot = await docRef.GetSnapshotAsync();
            if (!snapshot.Exists) return null;
            return snapshot.ConvertTo<SolicitacaoCompra>();
        }

        // 9. Obter Todas Solicitações de Compra
        public async Task<List<SolicitacaoCompra>> ObterTodasSolicitacoesCompraAsync()
        {
            var query = _db.Collection("solicitacoes_compra").OrderByDescending("DataSolicitacao");
            var snapshot = await query.GetSnapshotAsync();
            var lista = new List<SolicitacaoCompra>();
            foreach (var doc in snapshot.Documents)
            {
                if (doc.Exists)
                {
                    lista.Add(doc.ConvertTo<SolicitacaoCompra>());
                }
            }
            return lista;
        }

        // 10. Deletar Solicitação de Compra
        public async Task DeletarSolicitacaoCompraAsync(string id)
        {
            var docRef = _db.Collection("solicitacoes_compra").Document(id);
            await docRef.DeleteAsync();
        }

        // --- MÉTODOS DO SPRINT 6: HISTÓRICO ---

        public async Task SalvarHistoricoAsync(HistoricoDemanda historico)
        {
            if (string.IsNullOrEmpty(historico.Id))
            {
                historico.Id = Guid.NewGuid().ToString();
            }
            var docRef = _db.Collection("historico").Document(historico.Id);
            await docRef.SetAsync(historico);
        }

        public async Task<List<HistoricoDemanda>> ObterHistoricoPorDemandaAsync(string demandaId, int limite = 100)
        {
            var query = _db.Collection("historico")
                            .WhereEqualTo("DemandaId", demandaId)
                            .OrderByDescending("DataHora")
                            .Limit(limite);

            var snapshot = await query.GetSnapshotAsync();
            var lista = new List<HistoricoDemanda>();
            foreach (var doc in snapshot.Documents)
            {
                if (doc.Exists)
                {
                    lista.Add(doc.ConvertTo<HistoricoDemanda>());
                }
            }
            return lista;
        }

        public async Task<List<HistoricoDemanda>> ObterHistoricoTodosAsync(
            string? demandaId = null,
            string? usuarioMatricula = null,
            string? acao = null,
            DateTime? dataInicio = null,
            DateTime? dataFim = null,
            int limite = 100)
        {
            var query = _db.Collection("historico").OrderByDescending("DataHora");

            if (!string.IsNullOrEmpty(demandaId))
            {
                query = query.WhereEqualTo("DemandaId", demandaId);
            }
            if (!string.IsNullOrEmpty(usuarioMatricula))
            {
                query = query.WhereEqualTo("UsuarioMatricula", usuarioMatricula);
            }
            if (!string.IsNullOrEmpty(acao))
            {
                query = query.WhereEqualTo("Acao", acao);
            }

            query = query.Limit(limite);

            var snapshot = await query.GetSnapshotAsync();
            var lista = new List<HistoricoDemanda>();
            foreach (var doc in snapshot.Documents)
            {
                if (doc.Exists)
                {
                    lista.Add(doc.ConvertTo<HistoricoDemanda>());
                }
            }
            return lista;
        }

        // --- MÉTODOS DO SPRINT 6: NOTIFICAÇÕES ---

        public async Task SalvarNotificacaoAsync(Notificacao notificacao)
        {
            if (string.IsNullOrEmpty(notificacao.Id))
            {
                notificacao.Id = Guid.NewGuid().ToString();
            }
            var docRef = _db.Collection("notificacoes").Document(notificacao.Id);
            await docRef.SetAsync(notificacao);
        }

        public async Task<List<Notificacao>> ObterNotificacoesPorUsuarioAsync(string matricula, bool? lida = null, int limite = 50)
        {
            var query = _db.Collection("notificacoes")
                            .WhereEqualTo("UsuarioMatricula", matricula);

            if (lida.HasValue)
            {
                query = query.WhereEqualTo("Lida", lida.Value);
            }

            query = query.Limit(limite);

            var snapshot = await query.GetSnapshotAsync();
            var lista = new List<Notificacao>();
            foreach (var doc in snapshot.Documents)
            {
                if (doc.Exists)
                {
                    lista.Add(doc.ConvertTo<Notificacao>());
                }
            }
            return lista
                .OrderByDescending(n => n.DataCriacao)
                .Take(limite)
                .ToList();
        }

        public async Task<Notificacao?> ObterNotificacaoPorIdAsync(string id)
        {
            var docRef = _db.Collection("notificacoes").Document(id);
            var snapshot = await docRef.GetSnapshotAsync();
            if (!snapshot.Exists) return null;
            return snapshot.ConvertTo<Notificacao>();
        }

        public async Task MarcarNotificacaoLidaAsync(string id, bool lida = true)
        {
            var docRef = _db.Collection("notificacoes").Document(id);

            var updates = new Dictionary<string, object>
    {
        { "Lida", lida }
    };

            if (lida)
            {
                updates.Add("DataLeitura", DateTime.UtcNow);
            }
            else
            {
                await docRef.UpdateAsync(updates);
                await docRef.UpdateAsync(new Dictionary<string, object>
        {
            { "DataLeitura", FieldValue.Delete }
        });
                return;
            }

            await docRef.UpdateAsync(updates);
        }

        public async Task<int> ContarNotificacoesNaoLidasAsync(string matricula)
        {
            var query = _db.Collection("notificacoes")
                            .WhereEqualTo("UsuarioMatricula", matricula)
                            .WhereEqualTo("Lida", false);

            var snapshot = await query.GetSnapshotAsync();
            return snapshot.Documents.Count;
        }

        // --- MÉTODOS DO SPRINT 6: ANEXOS ---

        public async Task SalvarAnexoAsync(Anexo anexo)
        {
            if (string.IsNullOrEmpty(anexo.Id))
            {
                anexo.Id = Guid.NewGuid().ToString();
            }
            var docRef = _db.Collection("anexos").Document(anexo.Id);
            await docRef.SetAsync(anexo);
        }

        public async Task<Anexo?> ObterAnexoPorIdAsync(string id)
        {
            var docRef = _db.Collection("anexos").Document(id);
            var snapshot = await docRef.GetSnapshotAsync();
            if (!snapshot.Exists) return null;
            return snapshot.ConvertTo<Anexo>();
        }

        public async Task<List<Anexo>> ObterAnexosPorDemandaAsync(string demandaId)
        {
            var query = _db.Collection("anexos")
                            .WhereEqualTo("DemandaId", demandaId)
                            .OrderByDescending("DataUpload");

            var snapshot = await query.GetSnapshotAsync();
            var lista = new List<Anexo>();
            foreach (var doc in snapshot.Documents)
            {
                if (doc.Exists)
                {
                    lista.Add(doc.ConvertTo<Anexo>());
                }
            }
            return lista;
        }

        public async Task<List<Anexo>> ObterAnexosPorChecklistAsync(string checklistId)
        {
            var query = _db.Collection("anexos")
                            .WhereEqualTo("ChecklistId", checklistId)
                            .OrderByDescending("DataUpload");

            var snapshot = await query.GetSnapshotAsync();
            var lista = new List<Anexo>();
            foreach (var doc in snapshot.Documents)
            {
                if (doc.Exists)
                {
                    lista.Add(doc.ConvertTo<Anexo>());
                }
            }
            return lista;
        }

        public async Task DeletarAnexoAsync(string id)
        {
            var docRef = _db.Collection("anexos").Document(id);
            await docRef.DeleteAsync();
        }

        public async Task DeletarAnexosPorDemandaAsync(string demandaId)
        {
            var anexos = await ObterAnexosPorDemandaAsync(demandaId);
            foreach (var anexo in anexos)
            {
                await DeletarAnexoAsync(anexo.Id);
            }
        }
    }
}
