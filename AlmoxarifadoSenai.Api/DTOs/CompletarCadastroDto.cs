using System.ComponentModel.DataAnnotations;

namespace AlmoxarifadoSenai.Api.DTOs
{
    public class CompletarCadastroDto
    {
        [Required(ErrorMessage = "A matricula e obrigatoria.")]
        public string Matricula { get; set; } = string.Empty;

        [Required(ErrorMessage = "A data de nascimento e obrigatoria.")]
        public string DataNascimento { get; set; } = string.Empty;

        [Required(ErrorMessage = "O e-mail e obrigatorio.")]
        [EmailAddress(ErrorMessage = "E-mail invalido.")]
        public string Email { get; set; } = string.Empty;

        public string Telefone { get; set; } = string.Empty;

        public string Setor { get; set; } = string.Empty;
    }
}
