using System.ComponentModel.DataAnnotations;

namespace AlmoxarifadoSenai.Api.DTOs
{
    public class UsuarioUpdateDto
    {
        [Required(ErrorMessage = "O nome e obrigatorio.")]
        public string Nome { get; set; } = string.Empty;

        [Required(ErrorMessage = "O perfil e obrigatorio.")]
        public string Perfil { get; set; } = string.Empty;

        [Required(ErrorMessage = "A data de nascimento e obrigatoria.")]
        [RegularExpression(@"^\d{8}$", ErrorMessage = "Data deve ter 8 digitos (DDMMAAAA).")]
        public string DataNascimento { get; set; } = string.Empty;

        [Required(ErrorMessage = "O status ativo/inativo e obrigatorio.")]
        public bool Ativo { get; set; }

        [EmailAddress(ErrorMessage = "E-mail invalido.")]
        public string Email { get; set; } = string.Empty;

        public string Telefone { get; set; } = string.Empty;

        public string Setor { get; set; } = string.Empty;
    }
}
