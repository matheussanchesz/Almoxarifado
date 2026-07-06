using System.Security.Claims;
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
    public class NotificacoesController : ControllerBase
    {
        private readonly FirestoreService _firestoreService;

        public NotificacoesController(FirestoreService firestoreService)
        {
            _firestoreService = firestoreService;
        }

        [HttpGet]
        public async Task<IActionResult> ObterMinhasNotificacoes([FromQuery] bool? lida = null, [FromQuery] int limite = 50)
        {
            var matricula = User.FindFirst("Matricula")?.Value ?? string.Empty;
            var notificacoes = await _firestoreService.ObterNotificacoesPorUsuarioAsync(matricula, lida, limite);

            return Ok(notificacoes.Select(n => new NotificacaoDto
            {
                Id = n.Id,
                Titulo = n.Titulo,
                Mensagem = n.Mensagem,
                Tipo = n.Tipo,
                Icone = n.Icone,
                Cor = n.Cor,
                Link = n.Link,
                DemandaId = n.DemandaId,
                Lida = n.Lida,
                DataCriacao = n.DataCriacao,
                DataLeitura = n.DataLeitura
            }));
        }

        [HttpGet("nao-lidas/contador")]
        public async Task<IActionResult> ContarNaoLidas()
        {
            var matricula = User.FindFirst("Matricula")?.Value ?? string.Empty;
            var total = await _firestoreService.ContarNotificacoesNaoLidasAsync(matricula);
            return Ok(new { total });
        }

        [HttpPut("{id}/marcar-lida")]
        public async Task<IActionResult> MarcarLida(string id, [FromBody] NotificacaoMarcarLidaDto dto)
        {
            var notificacao = await _firestoreService.ObterNotificacaoPorIdAsync(id);
            if (notificacao == null)
            {
                return NotFound($"Notificação com ID {id} não encontrada.");
            }

            var matricula = User.FindFirst("Matricula")?.Value ?? string.Empty;
            if (notificacao.UsuarioMatricula != matricula)
            {
                return Forbid("Você só pode marcar suas próprias notificações.");
            }

            await _firestoreService.MarcarNotificacaoLidaAsync(id, dto.Lida);
            return Ok(new { mensagem = "Notificação atualizada com sucesso!" });
        }

        [HttpPut("marcar-todas-lidas")]
        public async Task<IActionResult> MarcarTodasLidas()
        {
            var matricula = User.FindFirst("Matricula")?.Value ?? string.Empty;
            var notificacoes = await _firestoreService.ObterNotificacoesPorUsuarioAsync(matricula, false, 1000);

            foreach (var notif in notificacoes)
            {
                await _firestoreService.MarcarNotificacaoLidaAsync(notif.Id, true);
            }

            return Ok(new { mensagem = $"Todas as {notificacoes.Count} notificações marcadas como lidas!" });
        }
    }
}