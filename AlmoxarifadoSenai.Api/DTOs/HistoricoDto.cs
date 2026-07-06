using System;
using System.Collections.Generic;

namespace AlmoxarifadoSenai.Api.DTOs
{
    public class HistoricoDto
    {
        public string Id { get; set; } = string.Empty;
        public string DemandaId { get; set; } = string.Empty;
        public string UsuarioNome { get; set; } = string.Empty;
        public string UsuarioPerfil { get; set; } = string.Empty;
        public string Acao { get; set; } = string.Empty;
        public string Detalhes { get; set; } = string.Empty;
        public DateTime DataHora { get; set; }
        public Dictionary<string, object>? DadosAntigos { get; set; }
        public Dictionary<string, object>? DadosNovos { get; set; }
    }

    public class HistoricoFiltroDto
    {
        public string? DemandaId { get; set; }
        public string? UsuarioMatricula { get; set; }
        public string? Acao { get; set; }
        public DateTime? DataInicio { get; set; }
        public DateTime? DataFim { get; set; }
        public int Limite { get; set; } = 100;
        public int Pagina { get; set; } = 1;
    }
}