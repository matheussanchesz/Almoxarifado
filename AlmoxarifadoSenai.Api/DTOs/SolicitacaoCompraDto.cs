using System;
using System.ComponentModel.DataAnnotations;

namespace AlmoxarifadoSenai.Api.DTOs
{
    public class SolicitacaoCompraCriarDto
    {
        [Required(ErrorMessage = "A categoria é obrigatória.")]
        public string Categoria { get; set; } = string.Empty; // Insumo, Ferramenta, Peça

        [Required(ErrorMessage = "O nome do item é obrigatório.")]
        public string NomeItem { get; set; } = string.Empty;

        public string Especificacao { get; set; } = string.Empty;

        [Required(ErrorMessage = "A quantidade é obrigatória.")]
        [Range(1, int.MaxValue, ErrorMessage = "A quantidade deve ser maior que zero.")]
        public int Quantidade { get; set; }

        public string Urgencia { get; set; } = "Normal";

        [Required(ErrorMessage = "A justificativa é obrigatória.")]
        public string Justificativa { get; set; } = string.Empty;
    }

    public class SolicitacaoCompraAtualizarDto
    {
        [Required(ErrorMessage = "O status é obrigatório.")]
        public string Status { get; set; } = string.Empty; // Aguardando, Aprovado, Rejeitado, Concluído
    }
}