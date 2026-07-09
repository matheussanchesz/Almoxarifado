using System.ComponentModel.DataAnnotations;

namespace AlmoxarifadoSenai.Api.DTOs
{
    public class RecuperarAcessoDto
    {
        [Required(ErrorMessage = "Informe e-mail ou matricula.")]
        public string Identificador { get; set; } = string.Empty;
    }
}
