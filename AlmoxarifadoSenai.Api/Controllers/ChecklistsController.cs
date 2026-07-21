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
    public class ChecklistsController : ControllerBase
    {
        private readonly FirestoreService _firestoreService;

        public ChecklistsController(FirestoreService firestoreService)
        {
            _firestoreService = firestoreService;
        }

        // 1. CRIAR CHECKLIST (Apenas Almoxarife e Admin)
        [HttpPost]
        [Authorize(Roles = $"{Perfis.OperacaoAlmoxarifado},{Perfis.Admin}")]
        public async Task<IActionResult> CriarChecklist([FromBody] ChecklistCriarDto dto)
        {
            var responsavelMatricula = User.FindFirst("Matricula")?.Value ?? string.Empty;
            var responsavelNome = User.FindFirst(ClaimTypes.Name)?.Value ?? string.Empty;
            var checklist = new Checklist
            {
                Nome = dto.Nome,
                Descricao = dto.Descricao,
                Oficina = dto.Oficina,
                DataCriacao = DateTime.UtcNow,
                Ativo = true,
                Itens = dto.Itens.Select(i => new ChecklistItem
                {
                    Id = string.IsNullOrEmpty(i.Id) ? Guid.NewGuid().ToString() : i.Id,
                    Descricao = i.Descricao,
                    Categoria = i.Categoria
                }).ToList()
            };

            await _firestoreService.SalvarChecklistAsync(checklist);
            await _firestoreService.NotificarTodosUsuariosAtivosAsync(new Notificacao
            {
                Titulo = "Novo checklist disponível",
                Mensagem = $"{responsavelNome} criou o checklist \"{checklist.Nome}\" para {checklist.Oficina}.",
                Tipo = "Informacao",
                Icone = "clipboard",
                Cor = "blue",
                Link = "/checklists",
                DadosAdicionais = new Dictionary<string, string>
                {
                    ["evento"] = "checklist_criado",
                    ["checklistId"] = checklist.Id,
                    ["remetenteMatricula"] = responsavelMatricula,
                    ["oficina"] = checklist.Oficina
                }
            });

            return Ok(new { mensagem = "Checklist criado com sucesso!", checklist });
        }

        // 2. LISTAR CHECKLISTS
        [HttpGet]
        public async Task<IActionResult> ListarChecklists([FromQuery] bool apenasAtivos = true)
        {
            var checklists = await _firestoreService.ObterTodosChecklistsAsync();

            if (apenasAtivos)
            {
                checklists = checklists.Where(c => c.Ativo).ToList();
            }

            return Ok(checklists);
        }

        // 3. OBTER CHECKLIST POR ID
        [HttpGet("{id}")]
        public async Task<IActionResult> ObterChecklist(string id)
        {
            var checklist = await _firestoreService.ObterChecklistPorIdAsync(id);
            if (checklist == null)
            {
                return NotFound($"Checklist com ID {id} não encontrado.");
            }
            return Ok(checklist);
        }

        // 4. EDITAR CHECKLIST (Apenas Almoxarife e Admin)
        [HttpPut("{id}")]
        [Authorize(Roles = $"{Perfis.OperacaoAlmoxarifado},{Perfis.Admin}")]
        public async Task<IActionResult> EditarChecklist(string id, [FromBody] ChecklistEditarDto dto)
        {
            var checklist = await _firestoreService.ObterChecklistPorIdAsync(id);
            if (checklist == null)
            {
                return NotFound($"Checklist com ID {id} não encontrado.");
            }

            checklist.Nome = dto.Nome;
            checklist.Descricao = dto.Descricao;
            checklist.Oficina = dto.Oficina;
            checklist.Ativo = dto.Ativo;
            checklist.Itens = dto.Itens.Select(i => new ChecklistItem
            {
                Id = string.IsNullOrEmpty(i.Id) ? Guid.NewGuid().ToString() : i.Id,
                Descricao = i.Descricao,
                Categoria = i.Categoria
            }).ToList();

            await _firestoreService.SalvarChecklistAsync(checklist);
            return Ok(new { mensagem = "Checklist atualizado com sucesso!", checklist });
        }

        // 5. DELETAR CHECKLIST (Apenas Admin)
        [HttpDelete("{id}")]
        [Authorize(Roles = Perfis.Admin)]
        public async Task<IActionResult> DeletarChecklist(string id)
        {
            var checklist = await _firestoreService.ObterChecklistPorIdAsync(id);
            if (checklist == null)
            {
                return NotFound($"Checklist com ID {id} não encontrado.");
            }

            await _firestoreService.DeletarChecklistAsync(id);
            return Ok(new { mensagem = "Checklist excluído com sucesso!" });
        }

        // 6. DUPLICAR CHECKLIST (Apenas Almoxarife e Admin)
        [HttpPost("{id}/duplicar")]
        [Authorize(Roles = $"{Perfis.OperacaoAlmoxarifado},{Perfis.Admin}")]
        public async Task<IActionResult> DuplicarChecklist(string id)
        {
            var checklistOriginal = await _firestoreService.ObterChecklistPorIdAsync(id);
            if (checklistOriginal == null)
            {
                return NotFound($"Checklist com ID {id} não encontrado.");
            }

            var novoChecklist = new Checklist
            {
                Nome = $"Cópia: {checklistOriginal.Nome}",
                Descricao = checklistOriginal.Descricao,
                Oficina = checklistOriginal.Oficina,
                DataCriacao = DateTime.UtcNow,
                Ativo = true,
                Itens = checklistOriginal.Itens.Select(i => new ChecklistItem
                {
                    Id = Guid.NewGuid().ToString(),
                    Descricao = i.Descricao,
                    Categoria = i.Categoria
                }).ToList()
            };

            await _firestoreService.SalvarChecklistAsync(novoChecklist);
            return Ok(new { mensagem = "Checklist duplicado com sucesso!", checklist = novoChecklist });
        }

        // 7. EXECUTAR CHECKLIST
        [HttpPost("executar")]
        [Authorize(Roles = $"{Perfis.OperacaoAlmoxarifado},{Perfis.Admin}")]
        public async Task<IActionResult> ExecutarChecklist([FromBody] ExecutarChecklistDto dto)
        {
            var checklist = await _firestoreService.ObterChecklistPorIdAsync(dto.ChecklistId);
            if (checklist == null)
            {
                return NotFound($"Checklist com ID {dto.ChecklistId} não encontrado.");
            }

            var almoxarifeMatricula = User.FindFirst("Matricula")?.Value ?? string.Empty;
            var almoxarifeNome = User.FindFirst(ClaimTypes.Name)?.Value ?? string.Empty;

            var execucao = new ExecucaoChecklist
            {
                ChecklistId = dto.ChecklistId,
                DemandaId = dto.DemandaId,
                AlmoxarifeMatricula = almoxarifeMatricula,
                AlmoxarifeNome = almoxarifeNome,
                DataExecucao = DateTime.UtcNow,
                Status = "Concluído",
                Itens = dto.Itens.Select(i => new ItemExecucao
                {
                    ItemId = i.ItemId,
                    Descricao = checklist.Itens.FirstOrDefault(item => item.Id == i.ItemId)?.Descricao ?? "",
                    Status = i.Status,
                    Observacao = i.Observacao,
                    FotoUrl = i.FotoUrl
                }).ToList()
            };

            await _firestoreService.SalvarExecucaoChecklistAsync(execucao);
            await _firestoreService.NotificarTodosUsuariosAtivosAsync(new Notificacao
            {
                Titulo = "Checklist concluído",
                Mensagem = $"{almoxarifeNome} concluiu o checklist \"{checklist.Nome}\" em {checklist.Oficina}.",
                Tipo = "Sucesso",
                Icone = "check",
                Cor = "green",
                Link = $"/checklists/visualizar/{execucao.Id}",
                DemandaId = string.IsNullOrWhiteSpace(execucao.DemandaId) ? null : execucao.DemandaId,
                DadosAdicionais = new Dictionary<string, string>
                {
                    ["evento"] = "checklist_concluido",
                    ["checklistId"] = checklist.Id,
                    ["execucaoId"] = execucao.Id,
                    ["remetenteMatricula"] = almoxarifeMatricula,
                    ["oficina"] = checklist.Oficina
                }
            });

            return Ok(new { mensagem = "Checklist executado com sucesso!", execucao });
        }

        // 8. LISTAR EXECUÇÕES DE CHECKLIST
        [HttpGet("execucoes")]
        public async Task<IActionResult> ListarExecucoes([FromQuery] string? demandaId = null)
        {
            var execucoes = await _firestoreService.ObterTodasExecucoesChecklistAsync();

            if (!string.IsNullOrEmpty(demandaId))
            {
                execucoes = execucoes.Where(e => e.DemandaId == demandaId).ToList();
            }

            return Ok(execucoes);
        }
    }
}
