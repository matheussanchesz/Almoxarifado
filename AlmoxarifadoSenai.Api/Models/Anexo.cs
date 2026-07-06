using System;
using Google.Cloud.Firestore;

namespace AlmoxarifadoSenai.Api.Models
{
    [FirestoreData]
    public class Anexo
    {
        [FirestoreProperty]
        public string Id { get; set; } = string.Empty;

        [FirestoreProperty]
        public string DemandaId { get; set; } = string.Empty;

        [FirestoreProperty]
        public string? ChecklistId { get; set; } = string.Empty;

        [FirestoreProperty]
        public string? ExecucaoChecklistId { get; set; } = string.Empty;

        [FirestoreProperty]
        public string NomeArquivo { get; set; } = string.Empty;

        [FirestoreProperty]
        public string Url { get; set; } = string.Empty;

        [FirestoreProperty]
        public string Tipo { get; set; } = string.Empty;
        // Foto, Documento, Video, etc.

        [FirestoreProperty]
        public string MimeType { get; set; } = string.Empty;
        // image/jpeg, image/png, application/pdf, etc.

        [FirestoreProperty]
        public string UsuarioMatricula { get; set; } = string.Empty;

        [FirestoreProperty]
        public string UsuarioNome { get; set; } = string.Empty;

        [FirestoreProperty]
        public DateTime DataUpload { get; set; } = DateTime.UtcNow;

        [FirestoreProperty]
        public long Tamanho { get; set; }

        [FirestoreProperty]
        public Dictionary<string, string> Metadados { get; set; } = new();
    }
}