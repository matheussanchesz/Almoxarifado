using System;
using System.Collections.Generic;

namespace AlmoxarifadoSenai.Api.DTOs
{
    public class DashboardDto
    {
        public IndicadoresGerais Indicadores { get; set; } = new();
        public List<DemandaStatusDto> DemandasPorStatus { get; set; } = new();
        public List<DemandaPrioridadeDto> DemandasPorPrioridade { get; set; } = new();
        public List<DemandaRecenteDto> DemandasRecentes { get; set; } = new();
        public List<DemandaAtrasadaDto> DemandasAtrasadas { get; set; } = new();
        public List<DesempenhoAlmoxarifeDto> DesempenhoAlmoxarifes { get; set; } = new();
        public List<DemandasPorOficinaDto> DemandasPorOficina { get; set; } = new();
        public List<DemandasPorPeriodoDto> DemandasUltimos7Dias { get; set; } = new();
    }

    public class IndicadoresGerais
    {
        public int TotalDemandas { get; set; }
        public int DemandasAbertas { get; set; }
        public int DemandasEmAndamento { get; set; }
        public int DemandasConcluidas { get; set; }
        public int DemandasCanceladas { get; set; }
        public int DemandasAtrasadas { get; set; }
        public int DemandasUrgentes { get; set; }
        public double TempoMedioAtendimentoHoras { get; set; }
        public double TaxaConclusao { get; set; }
        public int TotalAlmoxarifes { get; set; }
        public int TotalProfessores { get; set; }
    }

    public class DemandaStatusDto
    {
        public string Status { get; set; } = string.Empty;
        public int Quantidade { get; set; }
        public string Cor { get; set; } = string.Empty;
    }

    public class DemandaPrioridadeDto
    {
        public string Prioridade { get; set; } = string.Empty;
        public int Quantidade { get; set; }
        public string Cor { get; set; } = string.Empty;
    }

    public class DemandaRecenteDto
    {
        public string Id { get; set; } = string.Empty;
        public string Titulo { get; set; } = string.Empty;
        public string ProfessorNome { get; set; } = string.Empty;
        public string Oficina { get; set; } = string.Empty;
        public DateTime DataHoraNecessaria { get; set; }
        public string Prioridade { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime DataHoraCriacao { get; set; }
    }

    public class DemandaAtrasadaDto
    {
        public string Id { get; set; } = string.Empty;
        public string Titulo { get; set; } = string.Empty;
        public string ProfessorNome { get; set; } = string.Empty;
        public string Oficina { get; set; } = string.Empty;
        public DateTime DataHoraNecessaria { get; set; }
        public string Prioridade { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public int AtrasoHoras { get; set; }
        public string Gravidade { get; set; } = string.Empty; // Crítico, Alto, Médio, Baixo
    }

    public class DesempenhoAlmoxarifeDto
    {
        public string Matricula { get; set; } = string.Empty;
        public string Nome { get; set; } = string.Empty;
        public int TotalAtendimentos { get; set; }
        public int Concluidos { get; set; }
        public double TaxaConclusao { get; set; }
        public double TempoMedioAtendimentoHoras { get; set; }
    }

    public class DemandasPorOficinaDto
    {
        public string Oficina { get; set; } = string.Empty;
        public int Quantidade { get; set; }
    }

    public class DemandasPorPeriodoDto
    {
        public string Data { get; set; } = string.Empty;
        public int Quantidade { get; set; }
    }
}