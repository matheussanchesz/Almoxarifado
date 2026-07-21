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
    [Authorize] // Exige que o usuário esteja logado para qualquer rota aqui dentro
    public class DemandasController : ControllerBase
    {
        private readonly FirestoreService _firestoreService;

        public DemandasController(FirestoreService firestoreService)
        {
            _firestoreService = firestoreService;
        }

        // 1. CRIAR DEMANDA
        [HttpPost]
        [Authorize(Roles = $"{Perfis.Professor},{Perfis.Almoxarifado},{Perfis.Coordenador}")]
        public async Task<IActionResult> CriarDemanda([FromBody] DemandaCriarDto dto)
        {
            // Extrai as Claims armazenadas no Token JWT do usuário logado
            var professorMatricula = User.FindFirst("Matricula")?.Value ?? string.Empty;
            var professorNome = User.FindFirst(ClaimTypes.Name)?.Value ?? string.Empty;

            // ⭐ CONVERTE A DATA PARA UTC (CORREÇÃO DO ERRO)
            DateTime dataHoraNecessaria;
            try
            {
                // Tenta converter a string para DateTime (assume que é UTC)
                dataHoraNecessaria = DateTime.Parse(dto.DataHoraNecessaria, null, System.Globalization.DateTimeStyles.RoundtripKind);

                // Se não for UTC, converte para UTC
                if (dataHoraNecessaria.Kind != DateTimeKind.Utc)
                {
                    dataHoraNecessaria = dataHoraNecessaria.ToUniversalTime();
                }
            }
            catch (Exception)
            {
                return BadRequest("Formato de data inválido. Use ISO 8601 (ex: 2026-06-25T08:00:00Z)");
            }

            var novaDemanda = new Demanda
            {
                Titulo = dto.Titulo,
                Descricao = dto.Descricao,
                Oficina = dto.Oficina,
                DataHoraNecessaria = dataHoraNecessaria, // Agora é UTC
                Prioridade = dto.Prioridade,
                Status = "Aberta", // Toda demanda nasce Aberta
                DataHoraCriacao = DateTime.UtcNow,
                ProfessorMatricula = professorMatricula,
                ProfessorNome = professorNome
            };

            await _firestoreService.SalvarDemandaAsync(novaDemanda);
            await NotificarTodosNovaDemandaAsync(novaDemanda);

            return Ok(new { mensagem = "Demanda cadastrada com sucesso!", demanda = novaDemanda });
        }

        // 2. LISTAR DEMANDAS (Regra de negócio dinâmica)
        [HttpGet]
        public async Task<IActionResult> ListarDemandas()
        {
            var perfilLogado = User.FindFirst(ClaimTypes.Role)?.Value;
            var matriculaLogada = User.FindFirst("Matricula")?.Value ?? string.Empty;

            // Se for Professor, ele SÓ PODE VER as demandas que ele mesmo criou (Histórico dele)
            if (perfilLogado == Perfis.Professor)
            {
                var demandasProfessor = await _firestoreService.ObterDemandasPorProfessorAsync(matriculaLogada);
                return Ok(demandasProfessor);
            }

            // Se for Admin, Almoxarife ou Coordenador, visualiza TODAS as demandas do sistema
            var todasDemandas = await _firestoreService.ObterTodasDemandasAsync();
            return Ok(todasDemandas);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> ObterDemanda(string id)
        {
            var demanda = await _firestoreService.ObterDemandaPorIdAsync(id);
            if (demanda == null)
            {
                return NotFound($"Demanda com ID {id} não encontrada.");
            }

            var perfilLogado = User.FindFirst(ClaimTypes.Role)?.Value;
            var matriculaLogada = User.FindFirst("Matricula")?.Value ?? string.Empty;

            if (perfilLogado == Perfis.Professor && demanda.ProfessorMatricula != matriculaLogada)
            {
                return Forbid("Você só pode visualizar suas próprias demandas.");
            }

            return Ok(demanda);
        }

        // 3. ATUALIZAR STATUS (Para o Almoxarife / Coordenador / Admin aceitar ou recusar)
        [HttpPut("{id}/status")]
        [Authorize(Roles = $"{Perfis.OperacaoAlmoxarifado},{Perfis.Coordenador},{Perfis.Admin}")]
        public async Task<IActionResult> AtualizarStatus(string id, [FromBody] string novoStatus)
        {
            var demanda = await _firestoreService.ObterDemandaPorIdAsync(id);
            if (demanda == null)
            {
                return NotFound($"Demanda com ID {id} não encontrada.");
            }

            // Lista de status válidos (mais detalhados para o fluxo)
            var statusValidos = new[] { "Aberta", "Em Análise", "Em Andamento", "Aguardando Material", "Concluída", "Cancelada" };
            if (!statusValidos.Contains(novoStatus))
            {
                return BadRequest("Status inválido. Escolha entre: Aberta, Em Análise, Em Andamento, Aguardando Material, Concluída ou Cancelada.");
            }

            demanda.Status = novoStatus;
            await _firestoreService.SalvarDemandaAsync(demanda);
            await NotificarRemetenteRespostaCoordenadorAsync(demanda, novoStatus);

            return Ok(new { mensagem = $"Status da demanda atualizado para {novoStatus}!", demanda });
        }

        // 4. EDITAR DEMANDA (Apenas para Professor e Admin, e apenas se estiver "Aberta")
        [HttpPut("{id}")]
        [Authorize(Roles = $"{Perfis.Professor},{Perfis.Admin}")]
        public async Task<IActionResult> EditarDemanda(string id, [FromBody] DemandaEditarDto dto)
        {
            var demanda = await _firestoreService.ObterDemandaPorIdAsync(id);
            if (demanda == null)
            {
                return NotFound($"Demanda com ID {id} não encontrada.");
            }

            // Verifica se o usuário tem permissão para editar
            var perfilLogado = User.FindFirst(ClaimTypes.Role)?.Value;
            var matriculaLogada = User.FindFirst("Matricula")?.Value ?? string.Empty;

            // Se for Professor, só pode editar suas próprias demandas
            if (perfilLogado == Perfis.Professor && demanda.ProfessorMatricula != matriculaLogada)
            {
                return Forbid("Você só pode editar suas próprias demandas.");
            }

            // Só permite editar se estiver Aberta
            if (demanda.Status != "Aberta")
            {
                return BadRequest("Demandas com status diferente de 'Aberta' não podem ser editadas.");
            }

            // ⭐ CONVERTE A DATA PARA UTC (CORREÇÃO DO ERRO)
            DateTime dataHoraNecessaria;
            try
            {
                dataHoraNecessaria = DateTime.Parse(dto.DataHoraNecessaria, null, System.Globalization.DateTimeStyles.RoundtripKind);

                if (dataHoraNecessaria.Kind != DateTimeKind.Utc)
                {
                    dataHoraNecessaria = dataHoraNecessaria.ToUniversalTime();
                }
            }
            catch (Exception)
            {
                return BadRequest("Formato de data inválido. Use ISO 8601 (ex: 2026-06-25T08:00:00Z)");
            }

            // Atualiza os campos
            demanda.Titulo = dto.Titulo;
            demanda.Descricao = dto.Descricao;
            demanda.Oficina = dto.Oficina;
            demanda.DataHoraNecessaria = dataHoraNecessaria; // Agora é UTC
            demanda.Prioridade = dto.Prioridade;

            await _firestoreService.SalvarDemandaAsync(demanda);

            return Ok(new { mensagem = "Demanda atualizada com sucesso!", demanda });
        }

        // 5. DUPLICAR DEMANDA (Professor pode duplicar suas próprias demandas)
        [HttpPost("{id}/duplicar")]
        [Authorize(Roles = $"{Perfis.Professor},{Perfis.Admin}")]
        public async Task<IActionResult> DuplicarDemanda(string id)
        {
            var demandaOriginal = await _firestoreService.ObterDemandaPorIdAsync(id);
            if (demandaOriginal == null)
            {
                return NotFound($"Demanda com ID {id} não encontrada.");
            }

            // Verifica se o usuário tem permissão para duplicar
            var perfilLogado = User.FindFirst(ClaimTypes.Role)?.Value;
            var matriculaLogada = User.FindFirst("Matricula")?.Value ?? string.Empty;

            if (perfilLogado == Perfis.Professor && demandaOriginal.ProfessorMatricula != matriculaLogada)
            {
                return Forbid("Você só pode duplicar suas próprias demandas.");
            }

            // Cria uma nova demanda com os mesmos dados
            var novaDemanda = new Demanda
            {
                Titulo = $"Cópia: {demandaOriginal.Titulo}",
                Descricao = demandaOriginal.Descricao,
                Oficina = demandaOriginal.Oficina,
                DataHoraNecessaria = demandaOriginal.DataHoraNecessaria,
                Prioridade = demandaOriginal.Prioridade,
                Status = "Aberta",
                DataHoraCriacao = DateTime.UtcNow,
                ProfessorMatricula = demandaOriginal.ProfessorMatricula,
                ProfessorNome = demandaOriginal.ProfessorNome
            };

            await _firestoreService.SalvarDemandaAsync(novaDemanda);

            return Ok(new { mensagem = "Demanda duplicada com sucesso!", demanda = novaDemanda });
        }

        // 6. DELETAR DEMANDA (Apenas Admin)
        [HttpDelete("{id}")]
        [Authorize(Roles = Perfis.Admin)]
        public async Task<IActionResult> DeletarDemanda(string id)
        {
            var demanda = await _firestoreService.ObterDemandaPorIdAsync(id);
            if (demanda == null)
            {
                return NotFound($"Demanda com ID {id} não encontrada.");
            }

            await _firestoreService.DeletarDemandaAsync(id);

            return Ok(new { mensagem = "Demanda excluída com sucesso!" });
        }

        // 7. LISTAR DEMANDAS COM FILTROS
        [HttpGet("filtros")]
        public async Task<IActionResult> ListarDemandasComFiltros(
            [FromQuery] string? prioridade = null,
            [FromQuery] string? status = null,
            [FromQuery] string? oficina = null)
        {
            var perfilLogado = User.FindFirst(ClaimTypes.Role)?.Value;
            var matriculaLogada = User.FindFirst("Matricula")?.Value ?? string.Empty;

            List<Demanda> demandas;

            if (perfilLogado == Perfis.Professor)
            {
                demandas = await _firestoreService.ObterDemandasPorProfessorAsync(matriculaLogada);
            }
            else
            {
                demandas = await _firestoreService.ObterTodasDemandasAsync();
            }

            // Aplica filtros
            if (!string.IsNullOrEmpty(prioridade))
            {
                demandas = demandas.Where(d => d.Prioridade == prioridade).ToList();
            }

            if (!string.IsNullOrEmpty(status))
            {
                demandas = demandas.Where(d => d.Status == status).ToList();
            }

            if (!string.IsNullOrEmpty(oficina))
            {
                demandas = demandas.Where(d => d.Oficina.Contains(oficina, StringComparison.OrdinalIgnoreCase)).ToList();
            }

            return Ok(demandas);
        }

        private async Task NotificarTodosNovaDemandaAsync(Demanda demanda)
        {
            var total = await _firestoreService.NotificarTodosUsuariosAtivosAsync(new Notificacao
            {
                Titulo = "Nova demanda aberta",
                Mensagem = $"{demanda.ProfessorNome} abriu a demanda \"{demanda.Titulo}\".",
                Tipo = demanda.Prioridade == "Urgente" ? "Urgente" : "Informacao",
                Icone = demanda.Prioridade == "Urgente" ? "alert" : "info",
                Cor = demanda.Prioridade == "Urgente" ? "red" : "blue",
                Link = $"/demandas/detalhes/{demanda.Id}",
                DemandaId = demanda.Id,
                DadosAdicionais = new Dictionary<string, string>
                {
                    ["evento"] = "demanda_criada",
                    ["remetenteMatricula"] = demanda.ProfessorMatricula,
                    ["prioridade"] = demanda.Prioridade,
                    ["oficina"] = demanda.Oficina
                }
            });

            Console.WriteLine($"Notificações de nova demanda criadas: {total} para demanda {demanda.Id}.");
        }

        private async Task NotificarRemetenteRespostaCoordenadorAsync(Demanda demanda, string novoStatus)
        {
            var perfilLogado = User.FindFirst(ClaimTypes.Role)?.Value;
            var matriculaLogada = User.FindFirst("Matricula")?.Value ?? string.Empty;
            var nomeLogado = User.FindFirst(ClaimTypes.Name)?.Value ?? "Coordenador";

            if (perfilLogado != Perfis.Coordenador ||
                string.IsNullOrWhiteSpace(demanda.ProfessorMatricula) ||
                demanda.ProfessorMatricula == matriculaLogada)
            {
                return;
            }

            await _firestoreService.SalvarNotificacaoAsync(new Notificacao
            {
                UsuarioMatricula = demanda.ProfessorMatricula,
                Titulo = "Sua demanda foi respondida",
                Mensagem = $"{nomeLogado} atualizou a demanda \"{demanda.Titulo}\" para {novoStatus}.",
                Tipo = "Informacao",
                Icone = "info",
                Cor = "blue",
                Link = $"/demandas/detalhes/{demanda.Id}",
                DemandaId = demanda.Id,
                DadosAdicionais = new Dictionary<string, string>
                {
                    ["coordenadorMatricula"] = matriculaLogada,
                    ["status"] = novoStatus
                }
            });
        }
    }
}
