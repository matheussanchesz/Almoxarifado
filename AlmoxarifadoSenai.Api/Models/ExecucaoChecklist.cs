using System;
using System.Collections.Generic;
using Google.Cloud.Firestore;

namespace AlmoxarifadoSenai.Api.Models
{
    [FirestoreData]
    public class ExecucaoChecklist
    {
        [FirestoreProperty]
        public string Id { get; set; } = string.Empty;

        [FirestoreProperty]
        public string ChecklistId { get; set; } = string.Empty;

        [FirestoreProperty]
        public string DemandaId { get; set; } = string.Empty;

        [FirestoreProperty]
        public string AlmoxarifeMatricula { get; set; } = string.Empty;

        [FirestoreProperty]
        public string AlmoxarifeNome { get; set; } = string.Empty;

        [FirestoreProperty]
        public List<ItemExecucao> Itens { get; set; } = new List<ItemExecucao>();

        [FirestoreProperty]
        public DateTime DataExecucao { get; set; } = DateTime.UtcNow;

        [FirestoreProperty]
        public string Status { get; set; } = "Em Andamento"; // Em Andamento, Concluído, Cancelado
    }

    [FirestoreData]
    public class ItemExecucao
    {
        [FirestoreProperty]
        public string ItemId { get; set; } = string.Empty;

        [FirestoreProperty]
        public string Descricao { get; set; } = string.Empty;

        [FirestoreProperty]
        public string Status { get; set; } = "Pendente"; // Pendente, Conforme, Faltante, Danificado

        [FirestoreProperty]
        public string Observacao { get; set; } = string.Empty;

        [FirestoreProperty]
        public string FotoUrl { get; set; } = string.Empty;
    }
}