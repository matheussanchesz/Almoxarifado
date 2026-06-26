using System;
using Google.Cloud.Firestore;

namespace AlmoxarifadoSenai.Api.Models
{
    [FirestoreData]
    public class Notificacao
    {
        [FirestoreProperty]
        public string Id { get; set; } = string.Empty;

        [FirestoreProperty]
        public string UsuarioMatricula { get; set; } = string.Empty;

        [FirestoreProperty]
        public string Titulo { get; set; } = string.Empty;

        [FirestoreProperty]
        public string Mensagem { get; set; } = string.Empty;

        [FirestoreProperty]
        public string Tipo { get; set; } = string.Empty;
        // Urgente, Alerta, Informacao, Sucesso

        [FirestoreProperty]
        public string Icone { get; set; } = string.Empty;
        // 🔴, 🟡, 🔵, 🟢

        [FirestoreProperty]
        public string Cor { get; set; } = string.Empty;
        // red, yellow, blue, green

        [FirestoreProperty]
        public string? Link { get; set; } = string.Empty;
        // Para redirecionar para a demanda

        [FirestoreProperty]
        public string? DemandaId { get; set; } = string.Empty;

        [FirestoreProperty]
        public bool Lida { get; set; } = false;

        [FirestoreProperty]
        public DateTime DataCriacao { get; set; } = DateTime.UtcNow;

        [FirestoreProperty]
        public DateTime? DataLeitura { get; set; }

        [FirestoreProperty]
        public Dictionary<string, string> DadosAdicionais { get; set; } = new();
    }
}