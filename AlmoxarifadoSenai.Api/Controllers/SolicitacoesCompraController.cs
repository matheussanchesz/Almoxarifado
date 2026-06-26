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
    public class SolicitacoesCompraController : ControllerBase
    {
        private readonly FirestoreService _firestoreService;

        public SolicitacoesCompraController(FirestoreService firestoreService)
        {
            _firestoreService = firestoreService;
        }

        // 1. CRIAR SOLICITAÇÃO DE COMPRA (Apenas Almoxarife e Admin)
        [HttpPost]
        [Authorize(Roles = $"{Perfis.Almoxarife},{Perfis.Admin}")]
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
            return Ok(new { mensagem = "Solicitação de compra criada com sucesso!", solicitacao });
        }

        // 2. LISTAR SOLICITAÇÕES DE COMPRA
        [HttpGet]
        public async Task<IActionResult> ListarSolicitacoes([FromQuery] string? status = null)
        {
            var solicitacoes = await _firestoreService.ObterTodasSolicitacoesCompraAsync();

            if (!string.IsNullOrEmpty(status))
            {
                solicitacoes = solicitacoes.Where(s => s.Status == status).ToList();
            }

            return Ok(solicitacoes);
        }

        // 3. OBTER SOLICITAÇÃO POR ID
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

        // 4. ATUALIZAR STATUS (Apenas Admin e Coordenador)
        [HttpPut("{id}/status")]
        [Authorize(Roles = $"{Perfis.Admin},{Perfis.Coordenador}")]
        public async Task<IActionResult> AtualizarStatus(string id, [FromBody] SolicitacaoCompraAtualizarDto dto)
        {
            var solicitacao = await _firestoreService.ObterSolicitacaoCompraPorIdAsync(id);
            if (solicitacao == null)
            {
                return NotFound($"Solicitação com ID {id} não encontrada.");
            }

            var statusValidos = new[] { "Aguardando", "Aprovado", "Rejeitado", "Concluído" };
            if (!statusValidos.Contains(dto.Status))
            {
                return BadRequest("Status inválido. Escolha entre: Aguardando, Aprovado, Rejeitado ou Concluído.");
            }

            solicitacao.Status = dto.Status;
            await _firestoreService.SalvarSolicitacaoCompraAsync(solicitacao);

            return Ok(new { mensagem = $"Status atualizado para {dto.Status}!", solicitacao });
        }

        // 5. DELETAR SOLICITAÇÃO (Apenas Admin)
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
    }
}