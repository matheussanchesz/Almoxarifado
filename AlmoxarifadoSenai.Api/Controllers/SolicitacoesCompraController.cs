using System.Globalization;
using System.Security.Claims;
using System.Text;
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
    public class SolicitacoesCompraController : ControllerBase
    {
        private readonly FirestoreService _firestoreService;

        public SolicitacoesCompraController(FirestoreService firestoreService)
        {
            _firestoreService = firestoreService;
        }

        [HttpPost]
        [Authorize(Roles = $"{Perfis.OperacaoAlmoxarifado},{Perfis.Admin}")]
        public async Task<IActionResult> CriarSolicitacao([FromBody] SolicitacaoCompraCriarDto dto)
        {
            var almoxarifeMatricula = User.FindFirst("Matricula")?.Value ?? string.Empty;
            var almoxarifeNome = User.FindFirst(ClaimTypes.Name)?.Value ?? string.Empty;

            var solicitacao = new SolicitacaoCompra
            {
                Categoria = dto.Categoria,
                NomeItem = dto.NomeItem,
                Especificacao = dto.Especificacao,
                Quantidade = dto.Quantidade,
                Urgencia = dto.Urgencia,
                Justificativa = dto.Justificativa,
                AlmoxarifeMatricula = almoxarifeMatricula,
                AlmoxarifeNome = almoxarifeNome,
                DataSolicitacao = DateTime.UtcNow,
                Status = "Aguardando"
            };

            await _firestoreService.SalvarSolicitacaoCompraAsync(solicitacao);
            await _firestoreService.NotificarTodosUsuariosAtivosAsync(new Notificacao
            {
                Titulo = "Nova solicitação de compra",
                Mensagem = $"{almoxarifeNome} solicitou {solicitacao.Quantidade} unidade(s) de \"{solicitacao.NomeItem}\".",
                Tipo = solicitacao.Urgencia == "Urgente" ? "Urgente" : "Informacao",
                Icone = solicitacao.Urgencia == "Urgente" ? "alert" : "cart",
                Cor = solicitacao.Urgencia == "Urgente" ? "red" : "blue",
                Link = $"/compras/detalhes/{solicitacao.Id}",
                DadosAdicionais = new Dictionary<string, string>
                {
                    ["evento"] = "compra_criada",
                    ["solicitacaoId"] = solicitacao.Id,
                    ["remetenteMatricula"] = almoxarifeMatricula,
                    ["urgencia"] = solicitacao.Urgencia
                }
            });

            return Ok(new { mensagem = "Solicitação de compra criada com sucesso!", solicitacao });
        }

        [HttpGet]
        public async Task<IActionResult> ListarSolicitacoes([FromQuery] string? status = null)
        {
            var solicitacoes = await _firestoreService.ObterTodasSolicitacoesCompraAsync();

            if (!string.IsNullOrWhiteSpace(status))
            {
                var statusNormalizado = NormalizarStatusCompra(status);
                solicitacoes = solicitacoes
                    .Where(s => NormalizarStatusCompra(s.Status) == statusNormalizado)
                    .ToList();
            }

            return Ok(solicitacoes);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> ObterSolicitacao(string id)
        {
            var solicitacao = await _firestoreService.ObterSolicitacaoCompraPorIdAsync(id);
            if (solicitacao == null)
            {
                return NotFound($"Solicitação com ID {id} não encontrada.");
            }

            return Ok(solicitacao);
        }

        [HttpPut("{id}/status")]
        [Authorize(Roles = $"{Perfis.Admin},{Perfis.Coordenador}")]
        public async Task<IActionResult> AtualizarStatus(string id, [FromBody] SolicitacaoCompraAtualizarDto dto)
        {
            var solicitacao = await _firestoreService.ObterSolicitacaoCompraPorIdAsync(id);
            if (solicitacao == null)
            {
                return NotFound($"Solicitação com ID {id} não encontrada.");
            }

            var statusNormalizado = NormalizarStatusCompra(dto.Status);
            if (statusNormalizado == null)
            {
                return BadRequest("Status inválido. Escolha entre: Aguardando, Aprovado, Rejeitado ou Concluído.");
            }

            solicitacao.Status = statusNormalizado;
            await _firestoreService.SalvarSolicitacaoCompraAsync(solicitacao);

            return Ok(new { mensagem = $"Status atualizado para {statusNormalizado}!", solicitacao });
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = Perfis.Admin)]
        public async Task<IActionResult> DeletarSolicitacao(string id)
        {
            var solicitacao = await _firestoreService.ObterSolicitacaoCompraPorIdAsync(id);
            if (solicitacao == null)
            {
                return NotFound($"Solicitação com ID {id} não encontrada.");
            }

            await _firestoreService.DeletarSolicitacaoCompraAsync(id);
            return Ok(new { mensagem = "Solicitação excluída com sucesso!" });
        }

        private static string? NormalizarStatusCompra(string? status)
        {
            if (string.IsNullOrWhiteSpace(status))
            {
                return null;
            }

            var decomposed = status.Trim().Normalize(NormalizationForm.FormD);
            var semAcentos = new string(decomposed
                .Where(c => CharUnicodeInfo.GetUnicodeCategory(c) != UnicodeCategory.NonSpacingMark)
                .ToArray())
                .ToLowerInvariant();

            return semAcentos switch
            {
                "aguardando" => "Aguardando",
                "aprovado" => "Aprovado",
                "rejeitado" => "Rejeitado",
                "concluido" => "Concluído",
                _ => null
            };
        }
    }
}
