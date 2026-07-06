using System.Security.Claims;
using AlmoxarifadoSenai.Api.Constants;
using AlmoxarifadoSenai.Api.DTOs;
using AlmoxarifadoSenai.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AlmoxarifadoSenai.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class HistoricoController : ControllerBase
    {
        private readonly FirestoreService _firestoreService;

        public HistoricoController(FirestoreService firestoreService)
        {
            _firestoreService = firestoreService;
        }

        [HttpGet("demanda/{demandaId}")]
        public async Task<IActionResult> ObterHistoricoPorDemanda(string demandaId, [FromQuery] int limite = 50)
        {
            var historico = await _firestoreService.ObterHistoricoPorDemandaAsync(demandaId, limite);
            return Ok(historico.Select(h => new HistoricoDto
            {
                Id = h.Id,
                DemandaId = h.DemandaId,
                UsuarioNome = h.UsuarioNome,
                UsuarioPerfil = h.UsuarioPerfil,
                Acao = h.Acao,
                Detalhes = h.Detalhes,
                DataHora = h.DataHora,
                DadosAntigos = h.DadosAntigos,
                DadosNovos = h.DadosNovos
            }));
        }

        [HttpGet]
        [Authorize(Roles = $"{Perfis.Admin},{Perfis.Coordenador}")]
        public async Task<IActionResult> ObterHistoricoTodos(
            [FromQuery] string? demandaId = null,
            [FromQuery] string? usuarioMatricula = null,
            [FromQuery] string? acao = null,
            [FromQuery] int limite = 100)
        {
            var historico = await _firestoreService.ObterHistoricoTodosAsync(
                demandaId, usuarioMatricula, acao, null, null, limite);

            return Ok(historico.Select(h => new HistoricoDto
            {
                Id = h.Id,
                DemandaId = h.DemandaId,
                UsuarioNome = h.UsuarioNome,
                UsuarioPerfil = h.UsuarioPerfil,
                Acao = h.Acao,
                Detalhes = h.Detalhes,
                DataHora = h.DataHora,
                DadosAntigos = h.DadosAntigos,
                DadosNovos = h.DadosNovos
            }));
        }
    }
}