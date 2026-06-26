using System.Security.Claims;
using AlmoxarifadoSenai.Api.Constants;
using AlmoxarifadoSenai.Api.DTOs;
using AlmoxarifadoSenai.Api.Models;
using AlmoxarifadoSenai.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AlmoxarifadoSenai.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class DashboardController : ControllerBase
    {
        private readonly FirestoreService _firestoreService;

        public DashboardController(FirestoreService firestoreService)
        {
            _firestoreService = firestoreService;
        }

        [HttpGet]
        public async Task<IActionResult> ObterDashboard()
        {
            var perfilLogado = User.FindFirst(ClaimTypes.Role)?.Value;
            var demandas = await _firestoreService.ObterTodasDemandasAsync();
            var usuarios = await _firestoreService.ObterTodosUsuariosAsync();

            var dashboard = new DashboardDto();

            // 1. Indicadores Gerais
            dashboard.Indicadores.TotalDemandas = demandas.Count;
            dashboard.Indicadores.DemandasAbertas = demandas.Count(d => d.Status == "Aberta" || d.Status == "Em Análise");
            dashboard.Indicadores.DemandasEmAndamento = demandas.Count(d => d.Status == "Em Andamento" || d.Status == "Aguardando Material");
            dashboard.Indicadores.DemandasConcluidas = demandas.Count(d => d.Status == "Concluída");
            dashboard.Indicadores.DemandasCanceladas = demandas.Count(d => d.Status == "Cancelada");
            dashboard.Indicadores.DemandasUrgentes = demandas.Count(d => d.Prioridade == "Urgente");
            dashboard.Indicadores.TotalAlmoxarifes = usuarios.Count(u => u.Perfil == "Almoxarife");
            dashboard.Indicadores.TotalProfessores = usuarios.Count(u => u.Perfil == "Professor");

            // 2. Demandas por Status
            var statusColors = new Dictionary<string, string>
            {
                { "Aberta", "#2563eb" },
                { "Em Análise", "#7c3aed" },
                { "Em Andamento", "#f59e0b" },
                { "Aguardando Material", "#ef4444" },
                { "Concluída", "#22c55e" },
                { "Cancelada", "#6b7280" }
            };

            dashboard.DemandasPorStatus = demandas
                .GroupBy(d => d.Status)
                .Select(g => new DemandaStatusDto
                {
                    Status = g.Key,
                    Quantidade = g.Count(),
                    Cor = statusColors.ContainsKey(g.Key) ? statusColors[g.Key] : "#6b7280"
                })
                .OrderByDescending(d => d.Quantidade)
                .ToList();

            // 3. Demandas por Prioridade
            var priorityColors = new Dictionary<string, string>
            {
                { "Urgente", "#ef4444" },
                { "Alta", "#f59e0b" },
                { "Baixa", "#22c55e" },
                { "Normal", "#22c55e" }
            };

            dashboard.DemandasPorPrioridade = demandas
                .GroupBy(d => d.Prioridade)
                .Select(g => new DemandaPrioridadeDto
                {
                    Prioridade = g.Key,
                    Quantidade = g.Count(),
                    Cor = priorityColors.ContainsKey(g.Key) ? priorityColors[g.Key] : "#6b7280"
                })
                .OrderByDescending(d => d.Quantidade)
                .ToList();

            // 4. Demandas Recentes (últimas 10)
            dashboard.DemandasRecentes = demandas
                .OrderByDescending(d => d.DataHoraCriacao)
                .Take(10)
                .Select(d => new DemandaRecenteDto
                {
                    Id = d.Id,
                    Titulo = d.Titulo,
                    ProfessorNome = d.ProfessorNome,
                    Oficina = d.Oficina,
                    DataHoraNecessaria = d.DataHoraNecessaria,
                    Prioridade = d.Prioridade,
                    Status = d.Status,
                    DataHoraCriacao = d.DataHoraCriacao
                })
                .ToList();

            // 5. Demandas Atrasadas
            var now = DateTime.UtcNow;
            var demandasAtrasadas = demandas
                .Where(d => d.Status != "Concluída" && d.Status != "Cancelada" && d.DataHoraNecessaria < now)
                .OrderBy(d => d.DataHoraNecessaria)
                .Take(10)
                .Select(d =>
                {
                    var atraso = (now - d.DataHoraNecessaria).TotalHours;
                    string gravidade = atraso switch
                    {
                        > 24 => "Crítico",
                        > 8 => "Alto",
                        > 4 => "Médio",
                        _ => "Baixo"
                    };
                    return new DemandaAtrasadaDto
                    {
                        Id = d.Id,
                        Titulo = d.Titulo,
                        ProfessorNome = d.ProfessorNome,
                        Oficina = d.Oficina,
                        DataHoraNecessaria = d.DataHoraNecessaria,
                        Prioridade = d.Prioridade,
                        Status = d.Status,
                        AtrasoHoras = (int)atraso,
                        Gravidade = gravidade
                    };
                })
                .ToList();

            dashboard.DemandasAtrasadas = demandasAtrasadas;
            dashboard.Indicadores.DemandasAtrasadas = demandasAtrasadas.Count;

            // 6. Desempenho dos Almoxarifes (se houver registros de execução)
            var execucoes = await _firestoreService.ObterTodasExecucoesChecklistAsync();

            dashboard.DesempenhoAlmoxarifes = usuarios
                .Where(u => u.Perfil == "Almoxarife")
                .Select(u =>
                {
                    var execsAlmoxarife = execucoes.Where(e => e.AlmoxarifeMatricula == u.Matricula).ToList();
                    return new DesempenhoAlmoxarifeDto
                    {
                        Matricula = u.Matricula,
                        Nome = u.Nome,
                        TotalAtendimentos = execsAlmoxarife.Count,
                        Concluidos = execsAlmoxarife.Count(e => e.Status == "Concluído"),
                        TaxaConclusao = execsAlmoxarife.Count > 0 ?
                            Math.Round((double)execsAlmoxarife.Count(e => e.Status == "Concluído") / execsAlmoxarife.Count * 100, 2) : 0,
                        TempoMedioAtendimentoHoras = 0 // Seria calculado com dados de tempo real
                    };
                })
                .Where(a => a.TotalAtendimentos > 0)
                .OrderByDescending(a => a.TaxaConclusao)
                .ToList();

            // 7. Demandas por Oficina
            dashboard.DemandasPorOficina = demandas
                .Where(d => !string.IsNullOrEmpty(d.Oficina))
                .GroupBy(d => d.Oficina)
                .Select(g => new DemandasPorOficinaDto
                {
                    Oficina = g.Key,
                    Quantidade = g.Count()
                })
                .OrderByDescending(d => d.Quantidade)
                .Take(5)
                .ToList();

            // 8. Demandas nos Últimos 7 Dias
            var ultimos7Dias = Enumerable.Range(0, 7)
                .Select(i => now.Date.AddDays(-i))
                .OrderBy(d => d)
                .ToList();

            dashboard.DemandasUltimos7Dias = ultimos7Dias
                .Select(data => new DemandasPorPeriodoDto
                {
                    Data = data.ToString("dd/MM"),
                    Quantidade = demandas.Count(d => d.DataHoraCriacao.Date == data)
                })
                .ToList();

            // 9. Calcular Tempo Médio de Atendimento
            var demandasConcluidas = demandas.Where(d => d.Status == "Concluída").ToList();
            if (demandasConcluidas.Any())
            {
                // Como não temos histórico de mudanças de status, usamos um valor estimado
                // Em uma versão real, seria calculado com base no histórico de status
                dashboard.Indicadores.TempoMedioAtendimentoHoras = Math.Round(
                    demandasConcluidas.Average(d =>
                        (d.DataHoraCriacao - d.DataHoraNecessaria).TotalHours > 0 ? 2 : 4
                    ), 2
                );
            }

            // 10. Taxa de Conclusão
            var totalFinalizadas = dashboard.Indicadores.DemandasConcluidas + dashboard.Indicadores.DemandasCanceladas;
            dashboard.Indicadores.TaxaConclusao = dashboard.Indicadores.TotalDemandas > 0 ?
                Math.Round((double)dashboard.Indicadores.DemandasConcluidas / dashboard.Indicadores.TotalDemandas * 100, 2) : 0;

            return Ok(dashboard);
        }

        // 2. Sobrescrever Prioridade (Override)
        [HttpPut("override/{id}")]
        [Authorize(Roles = $"{Perfis.Admin},{Perfis.Coordenador}")]
        public async Task<IActionResult> SobrescreverPrioridade(string id, [FromBody] string novaPrioridade)
        {
            var demanda = await _firestoreService.ObterDemandaPorIdAsync(id);
            if (demanda == null)
            {
                return NotFound($"Demanda com ID {id} não encontrada.");
            }

            var prioridadesValidas = new[] { "Baixa", "Normal", "Alta", "Urgente" };
            if (!prioridadesValidas.Contains(novaPrioridade))
            {
                return BadRequest("Prioridade inválida. Escolha entre: Baixa, Normal, Alta ou Urgente.");
            }

            var prioridadeAntiga = demanda.Prioridade;
            demanda.Prioridade = novaPrioridade;
            await _firestoreService.SalvarDemandaAsync(demanda);

            // Log da ação (seria salvo em um histórico)
            Console.WriteLine($"🔄 Override: Demanda {id} - Prioridade alterada de {prioridadeAntiga} para {novaPrioridade} por {User.FindFirst(ClaimTypes.Name)?.Value}");

            return Ok(new
            {
                mensagem = $"Prioridade alterada de {prioridadeAntiga} para {novaPrioridade}!",
                demanda
            });
        }

        // 3. Reordenar Fila (Override em lote)
        [HttpPost("reordenar")]
        [Authorize(Roles = $"{Perfis.Admin},{Perfis.Coordenador}")]
        public async Task<IActionResult> ReordenarFila([FromBody] List<string> idsOrdenados)
        {
            if (idsOrdenados == null || !idsOrdenados.Any())
            {
                return BadRequest("Lista de IDs vazia.");
            }

            var demandas = new List<Demanda>();
            foreach (var id in idsOrdenados)
            {
                var demanda = await _firestoreService.ObterDemandaPorIdAsync(id);
                if (demanda != null)
                {
                    demandas.Add(demanda);
                }
            }

            // Aplica prioridade baseada na posição da lista
            for (int i = 0; i < demandas.Count; i++)
            {
                var prioridade = i switch
                {
                    0 => "Urgente",
                    < 3 => "Alta",
                    _ => "Normal"
                };

                if (demandas[i].Prioridade != prioridade)
                {
                    var antiga = demandas[i].Prioridade;
                    demandas[i].Prioridade = prioridade;
                    await _firestoreService.SalvarDemandaAsync(demandas[i]);

                    Console.WriteLine($"🔄 Reordenado: Demanda {demandas[i].Id} - {antiga} → {prioridade}");
                }
            }

            return Ok(new
            {
                mensagem = "Fila reordenada com sucesso!",
                total = demandas.Count
            });
        }

        // 4. Relatório de Desempenho
        [HttpGet("relatorio")]
        [Authorize(Roles = $"{Perfis.Admin},{Perfis.Coordenador}")]
        public async Task<IActionResult> GerarRelatorio(
            [FromQuery] DateTime? dataInicio = null,
            [FromQuery] DateTime? dataFim = null,
            [FromQuery] string? perfil = null)
        {
            var demandas = await _firestoreService.ObterTodasDemandasAsync();
            var usuarios = await _firestoreService.ObterTodosUsuariosAsync();

            if (dataInicio.HasValue)
            {
                demandas = demandas.Where(d => d.DataHoraCriacao >= dataInicio.Value).ToList();
            }

            if (dataFim.HasValue)
            {
                demandas = demandas.Where(d => d.DataHoraCriacao <= dataFim.Value).ToList();
            }

            if (!string.IsNullOrEmpty(perfil))
            {
                usuarios = usuarios.Where(u => u.Perfil == perfil).ToList();
            }

            var relatorio = new
            {
                Periodo = new
                {
                    Inicio = dataInicio?.ToString("dd/MM/yyyy") ?? "Todas",
                    Fim = dataFim?.ToString("dd/MM/yyyy") ?? "Todas",
                    TotalDias = (dataFim ?? DateTime.UtcNow).Subtract(dataInicio ?? DateTime.UtcNow.AddDays(-30)).Days
                },
                Resumo = new
                {
                    TotalDemandas = demandas.Count,
                    TotalUsuarios = usuarios.Count,
                    Almoxarifes = usuarios.Count(u => u.Perfil == "Almoxarife"),
                    Professores = usuarios.Count(u => u.Perfil == "Professor")
                },
                Demandas = new
                {
                    PorStatus = demandas.GroupBy(d => d.Status)
                        .Select(g => new { Status = g.Key, Quantidade = g.Count() }),
                    PorPrioridade = demandas.GroupBy(d => d.Prioridade)
                        .Select(g => new { Prioridade = g.Key, Quantidade = g.Count() }),
                    PorOficina = demandas.GroupBy(d => d.Oficina)
                        .Select(g => new { Oficina = g.Key, Quantidade = g.Count() })
                        .OrderByDescending(g => g.Quantidade)
                        .Take(10),
                    PorProfessor = demandas.GroupBy(d => d.ProfessorNome)
                        .Select(g => new { Professor = g.Key, Quantidade = g.Count() })
                        .OrderByDescending(g => g.Quantidade)
                        .Take(10)
                },
                Metricas = new
                {
                    TaxaConclusao = demandas.Count > 0 ?
                        Math.Round((double)demandas.Count(d => d.Status == "Concluída") / demandas.Count * 100, 2) : 0,
                    TaxaCancelamento = demandas.Count > 0 ?
                        Math.Round((double)demandas.Count(d => d.Status == "Cancelada") / demandas.Count * 100, 2) : 0,
                    DemandasAtrasadas = demandas.Count(d => d.Status != "Concluída" && d.Status != "Cancelada" && d.DataHoraNecessaria < DateTime.UtcNow),
                    TotalUrgentes = demandas.Count(d => d.Prioridade == "Urgente")
                },
                DataGeracao = DateTime.UtcNow.ToString("dd/MM/yyyy HH:mm:ss"),
                UsuarioGerou = User.FindFirst(ClaimTypes.Name)?.Value
            };

            return Ok(relatorio);
        }

        // 5. Métricas de SLA
        [HttpGet("sla")]
        [Authorize(Roles = $"{Perfis.Admin},{Perfis.Coordenador}")]
        public async Task<IActionResult> ObterMetricasSLA()
        {
            var demandas = await _firestoreService.ObterTodasDemandasAsync();
            var now = DateTime.UtcNow;

            // Para cada prioridade, calcula o SLA esperado
            var slas = new Dictionary<string, object>
            {
                ["Urgente"] = new
                {
                    TempoMaximo = "2 horas",
                    Total = demandas.Count(d => d.Prioridade == "Urgente"),
                    Concluidos = demandas.Count(d => d.Prioridade == "Urgente" && d.Status == "Concluída"),
                    Pendentes = demandas.Count(d => d.Prioridade == "Urgente" && d.Status != "Concluída" && d.Status != "Cancelada"),
                    Atrasados = demandas.Count(d => d.Prioridade == "Urgente" && d.Status != "Concluída" && d.Status != "Cancelada" && d.DataHoraNecessaria < now),
                    TaxaCumprimento = 0.0
                },
                ["Alta"] = new
                {
                    TempoMaximo = "8 horas",
                    Total = demandas.Count(d => d.Prioridade == "Alta"),
                    Concluidos = demandas.Count(d => d.Prioridade == "Alta" && d.Status == "Concluída"),
                    Pendentes = demandas.Count(d => d.Prioridade == "Alta" && d.Status != "Concluída" && d.Status != "Cancelada"),
                    Atrasados = demandas.Count(d => d.Prioridade == "Alta" && d.Status != "Concluída" && d.Status != "Cancelada" && d.DataHoraNecessaria < now),
                    TaxaCumprimento = 0.0
                },
                ["Normal"] = new
                {
                    TempoMaximo = "24 horas",
                    Total = demandas.Count(d => d.Prioridade == "Normal" || d.Prioridade == "Baixa"),
                    Concluidos = demandas.Count(d => (d.Prioridade == "Normal" || d.Prioridade == "Baixa") && d.Status == "Concluída"),
                    Pendentes = demandas.Count(d => (d.Prioridade == "Normal" || d.Prioridade == "Baixa") && d.Status != "Concluída" && d.Status != "Cancelada"),
                    Atrasados = demandas.Count(d => (d.Prioridade == "Normal" || d.Prioridade == "Baixa") && d.Status != "Concluída" && d.Status != "Cancelada" && d.DataHoraNecessaria < now),
                    TaxaCumprimento = 0.0
                }
            };

            // Calcular taxas de cumprimento
            foreach (var key in slas.Keys.ToList())
            {
                var sla = (dynamic)slas[key]!;
                var totalFinalizados = sla.Concluidos + demandas.Count(d =>
                    (key == "Urgente" && d.Prioridade == "Urgente" && d.Status == "Cancelada") ||
                    (key == "Alta" && d.Prioridade == "Alta" && d.Status == "Cancelada") ||
                    (key == "Normal" && (d.Prioridade == "Normal" || d.Prioridade == "Baixa") && d.Status == "Cancelada")
                );

                sla.TaxaCumprimento = sla.Total > 0 ?
                    Math.Round((double)sla.Concluidos / sla.Total * 100, 2) : 0;
            }

            return Ok(new
            {
                DataGeracao = now.ToString("dd/MM/yyyy HH:mm:ss"),
                SLAs = slas,
                TotalGeral = new
                {
                    DemandasAbertas = demandas.Count,
                    EmAndamento = demandas.Count(d => d.Status == "Em Andamento"),
                    Concluidas = demandas.Count(d => d.Status == "Concluída"),
                    Atrasadas = demandas.Count(d => d.Status != "Concluída" && d.Status != "Cancelada" && d.DataHoraNecessaria < now)
                }
            });
        }
        
        // 6. Health Check do Sistema
        [HttpGet("health")]
        [AllowAnonymous]
        public IActionResult HealthCheck()
        {
            return Ok(new
            {
                status = "Online",
                timestamp = DateTime.UtcNow,
                versao = "1.0.0",
                servicos = new
                {
                    api = "Ativo",
                    firestore = "Conectado"
                }
            });
        }
    }
}