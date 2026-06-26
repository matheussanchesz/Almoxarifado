using System;
using Google.Cloud.Firestore;

namespace AlmoxarifadoSenai.Api.Models
{
    [FirestoreData]
    public class SolicitacaoCompra
    {
        [FirestoreProperty]
        public string Id { get; set; } = string.Empty;

        [FirestoreProperty]
        public string Categoria { get; set; } = string.Empty; // Insumo, Ferramenta, Peça

        [FirestoreProperty]
        public string NomeItem { get; set; } = string.Empty;

        [FirestoreProperty]
        public string Especificacao { get; set; } = string.Empty;

        [FirestoreProperty]
        public int Quantidade { get; set; }

        [FirestoreProperty]
        public string Urgencia { get; set; } = "Normal"; // Normal, Alta, Urgente

        [FirestoreProperty]
        public string Justificativa { get; set; } = string.Empty;

        [FirestoreProperty]
        public string AlmoxarifeMatricula { get; set; } = string.Empty;

        [FirestoreProperty]
        public string AlmoxarifeNome { get; set; } = string.Empty;

        [FirestoreProperty]
        public DateTime DataSolicitacao { get; set; } = DateTime.UtcNow;

        [FirestoreProperty]
        public string Status { get; set; } = "Aguardando"; // Aguardando, Aprovado, Rejeitado, Concluído
    }
}