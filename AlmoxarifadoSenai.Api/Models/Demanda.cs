using System;
using Google.Cloud.Firestore;

namespace AlmoxarifadoSenai.Api.Models
{
    [FirestoreData]
    public class Demanda
    {
        [FirestoreProperty]
        public string Id { get; set; } = string.Empty; // ID único gerado automaticamente pelo Firestore

        [FirestoreProperty]
        public string Titulo { get; set; } = string.Empty;

        [FirestoreProperty]
        public string Descricao { get; set; } = string.Empty;

        [FirestoreProperty]
        public string Oficina { get; set; } = string.Empty; // Ex: Mecânica, Elétrica...

        [FirestoreProperty]
        public DateTime DataHoraCriacao { get; set; } = DateTime.UtcNow;

        [FirestoreProperty]
        public DateTime DataHoraNecessaria { get; set; } // Quando o professor precisa usar

        [FirestoreProperty]
        public string Prioridade { get; set; } = string.Empty; // Baixa, Alta, Urgente

        [FirestoreProperty]
        public string Status { get; set; } = "Aberta"; // Aberta, Em Andamento, Atendida, Recusada

        // Propriedades de rastreabilidade (Quem pediu)
        [FirestoreProperty]
        public string ProfessorMatricula { get; set; } = string.Empty;

        [FirestoreProperty]
        public string ProfessorNome { get; set; } = string.Empty;
    }
}