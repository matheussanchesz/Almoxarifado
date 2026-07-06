using System;
using Google.Cloud.Firestore;

namespace AlmoxarifadoSenai.Api.Models
{
    [FirestoreData]
    public class HistoricoDemanda
    {
        [FirestoreProperty]
        public string Id { get; set; } = string.Empty;

        [FirestoreProperty]
        public string DemandaId { get; set; } = string.Empty;

        [FirestoreProperty]
        public string UsuarioMatricula { get; set; } = string.Empty;

        [FirestoreProperty]
        public string UsuarioNome { get; set; } = string.Empty;

        [FirestoreProperty]
        public string UsuarioPerfil { get; set; } = string.Empty;

        [FirestoreProperty]
        public string Acao { get; set; } = string.Empty;
        // Criou, Editou, MudouStatus, Duplicou, Deletou, Atribuiu, Reordenou, AdicionouAnexo, RemoveuAnexo

        [FirestoreProperty]
        public string Detalhes { get; set; } = string.Empty;

        [FirestoreProperty]
        public DateTime DataHora { get; set; } = DateTime.UtcNow;

        [FirestoreProperty]
        public Dictionary<string, object> DadosAntigos { get; set; } = new();

        [FirestoreProperty]
        public Dictionary<string, object> DadosNovos { get; set; } = new();
    }
}