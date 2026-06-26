using System;
using System.ComponentModel.DataAnnotations;

namespace AlmoxarifadoSenai.Api.DTOs
{
    public class UsuarioUpdateDto
    {
        [Required(ErrorMessage = "O nome é obrigatório.")]
        public string Nome { get; set; } = string.Empty;

        [Required(ErrorMessage = "O perfil é obrigatório.")]
        public string Perfil { get; set; } = string.Empty;

        [Required(ErrorMessage = "A data de nascimento é obrigatória.")]
        [RegularExpression(@"^\d{8}$", ErrorMessage = "Data deve ter 8 dígitos (DDMMYYYY)")]
        public string DataNascimento { get; set; } = string.Empty;

        [Required(ErrorMessage = "O status ativo/inativo é obrigatório.")]
        public bool Ativo { get; set; }
    }
}