using System;

namespace AlmoxarifadoSenai.Api.DTOs
{
    public class AnexoDto
    {
        public string Id { get; set; } = string.Empty;
        public string DemandaId { get; set; } = string.Empty;
        public string NomeArquivo { get; set; } = string.Empty;
        public string Url { get; set; } = string.Empty;
        public string Tipo { get; set; } = string.Empty;
        public string MimeType { get; set; } = string.Empty;
        public string UsuarioNome { get; set; } = string.Empty;
        public DateTime DataUpload { get; set; }
        public long Tamanho { get; set; }
    }

    public class AnexoUploadDto
    {
        public string DemandaId { get; set; } = string.Empty;
        public string? ChecklistId { get; set; } = string.Empty;
        public string? ExecucaoChecklistId { get; set; } = string.Empty;
        public string Base64Image { get; set; } = string.Empty;
        public string NomeArquivo { get; set; } = string.Empty;
        public string Tipo { get; set; } = "Foto";
    }
}