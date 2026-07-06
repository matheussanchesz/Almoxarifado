using System;
using System.ComponentModel.DataAnnotations;

namespace AlmoxarifadoSenai.Api.DTOs
{
    public class DemandaEditarDto
    {
        [Required(ErrorMessage = "O título é obrigatório.")]
        public string Titulo { get; set; } = string.Empty;

        [Required(ErrorMessage = "A descrição dos materiais é obrigatória.")]
        public string Descricao { get; set; } = string.Empty;

        [Required(ErrorMessage = "A oficina (Mecânica, Elétrica, etc.) é obrigatória.")]
        public string Oficina { get; set; } = string.Empty;

        [Required(ErrorMessage = "A data e hora que precisa do material é obrigatória.")]
        public string DataHoraNecessaria { get; set; } = string.Empty; 

        [Required(ErrorMessage = "A prioridade (Baixa, Alta, Urgente) é obrigatória.")]
        public string Prioridade { get; set; } = string.Empty;
    }
}