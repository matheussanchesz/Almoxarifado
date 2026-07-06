using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace AlmoxarifadoSenai.Api.DTOs
{
    public class ChecklistCriarDto
    {
        [Required(ErrorMessage = "O nome é obrigatório.")]
        public string Nome { get; set; } = string.Empty;

        public string Descricao { get; set; } = string.Empty;

        [Required(ErrorMessage = "A oficina é obrigatória.")]
        public string Oficina { get; set; } = string.Empty;

        public List<ChecklistItemDto> Itens { get; set; } = new List<ChecklistItemDto>();
    }

    public class ChecklistEditarDto
    {
        [Required(ErrorMessage = "O nome é obrigatório.")]
        public string Nome { get; set; } = string.Empty;

        public string Descricao { get; set; } = string.Empty;

        [Required(ErrorMessage = "A oficina é obrigatória.")]
        public string Oficina { get; set; } = string.Empty;

        public List<ChecklistItemDto> Itens { get; set; } = new List<ChecklistItemDto>();

        public bool Ativo { get; set; } = true;
    }

    public class ChecklistItemDto
    {
        public string Id { get; set; } = string.Empty;

        [Required(ErrorMessage = "A descrição do item é obrigatória.")]
        public string Descricao { get; set; } = string.Empty;

        public string Categoria { get; set; } = string.Empty;
    }

    public class ExecutarChecklistDto
    {
        [Required(ErrorMessage = "O ID do checklist é obrigatório.")]
        public string ChecklistId { get; set; } = string.Empty;

        public string DemandaId { get; set; } = string.Empty;

        public List<ItemExecucaoDto> Itens { get; set; } = new List<ItemExecucaoDto>();
    }

    public class ItemExecucaoDto
    {
        public string ItemId { get; set; } = string.Empty;
        public string Status { get; set; } = "Conforme"; // Conforme, Faltante, Danificado
        public string Observacao { get; set; } = string.Empty;
        public string FotoUrl { get; set; } = string.Empty;
    }
}