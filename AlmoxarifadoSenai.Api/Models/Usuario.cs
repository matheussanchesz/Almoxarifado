using System;
using Google.Cloud.Firestore;

namespace AlmoxarifadoSenai.Api.Models
{
    [FirestoreData]
    public class Usuario
    {
        [FirestoreProperty]
        public string Matricula { get; set; } = string.Empty;

        [FirestoreProperty]
        public string Nome { get; set; } = string.Empty;

        [FirestoreProperty]
        public string Perfil { get; set; } = string.Empty;

        [FirestoreProperty]
        public DateTime DataNascimento { get; set; }

        [FirestoreProperty]
        public bool Ativo { get; set; } = true;
    }
}