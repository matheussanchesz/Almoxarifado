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
        public string DataNascimento { get; set; } = string.Empty;

        [FirestoreProperty]
        public bool Ativo { get; set; } = true;

        [FirestoreProperty]
        public string Email { get; set; } = string.Empty;

        [FirestoreProperty]
        public string Telefone { get; set; } = string.Empty;

        [FirestoreProperty]
        public string Setor { get; set; } = string.Empty;

        [FirestoreProperty]
        public bool PrimeiroAcesso { get; set; } = true;
    }
}
