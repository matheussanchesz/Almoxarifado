using System;
using System.Collections.Generic;
using Google.Cloud.Firestore;

namespace AlmoxarifadoSenai.Api.Models
{
    [FirestoreData]
    public class Checklist
    {
        [FirestoreProperty]
        public string Id { get; set; } = string.Empty;

        [FirestoreProperty]
        public string Nome { get; set; } = string.Empty;

        [FirestoreProperty]
        public string Descricao { get; set; } = string.Empty;

        [FirestoreProperty]
        public string Oficina { get; set; } = string.Empty;

        [FirestoreProperty]
        public List<ChecklistItem> Itens { get; set; } = new List<ChecklistItem>();

        [FirestoreProperty]
        public DateTime DataCriacao { get; set; } = DateTime.UtcNow;

        [FirestoreProperty]
        public bool Ativo { get; set; } = true;
    }

    [FirestoreData]
    public class ChecklistItem
    {
        [FirestoreProperty]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        [FirestoreProperty]
        public string Descricao { get; set; } = string.Empty;

        [FirestoreProperty]
        public string Categoria { get; set; } = string.Empty; // Ferramenta, Material, Equipamento, etc.
    }
}