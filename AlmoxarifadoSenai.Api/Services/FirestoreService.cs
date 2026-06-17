using Google.Cloud.Firestore;
using AlmoxarifadoSenai.Api.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace AlmoxarifadoSenai.Api.Services
{
    public class FirestoreService
    {
        private readonly FirestoreDb _db;
        private const string ColecaoUsuarios = "usuarios";

        public FirestoreService()
        {
            _db = FirestoreDb.Create("almoxarifadosenai-d7cca");
        }

        public FirestoreDb GetDatabase()
        {
            return _db;
        }

        // 1. Cria ou Atualiza Usuário
        public async Task SalvarUsuarioAsync(Usuario usuario)
        {
            // Usamos a matrícula como o ID do documento para facilitar a busca posterior
            DocumentReference docRef = _db.Collection(ColecaoUsuarios).Document(usuario.Matricula);
            await docRef.SetAsync(usuario, SetOptions.Overwrite);
        }

        // 2. Busca Usuário por Matrícula
        public async Task<Usuario?> ObterUsuarioPorMatriculaAsync(string matricula)
        {
            DocumentReference docRef = _db.Collection(ColecaoUsuarios).Document(matricula);
            DocumentSnapshot snapshot = await docRef.GetSnapshotAsync();

            if (snapshot.Exists)
            {
                return snapshot.ConvertTo<Usuario>();
            }

            return null;
        }

        public async Task<List<Usuario>> ObterTodosUsuariosAsync()
        {
            Query query = _db.Collection(ColecaoUsuarios);
            QuerySnapshot snapshot = await query.GetSnapshotAsync();

            var usuarios = new List<Usuario>();
            foreach (DocumentSnapshot document in snapshot.Documents)
            {
                usuarios.Add(document.ConvertTo<Usuario>());
            }

            return usuarios;
        }
    }
}