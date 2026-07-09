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
    [Authorize(Roles = Perfis.Admin + "," + Perfis.Coordenador)]
    public class UsuariosController : ControllerBase
    {
        private static readonly HashSet<string> PerfisPermitidos = new()
        {
            Perfis.Admin,
            Perfis.Coordenador,
            Perfis.Almoxarifado,
            Perfis.Professor
        };

        private readonly FirestoreService _firestoreService;

        public UsuariosController(FirestoreService firestoreService)
        {
            _firestoreService = firestoreService;
        }

        [HttpPost]
        public async Task<IActionResult> CriarUsuario([FromBody] UsuarioCreateDto dto)
        {
            if (!PerfisPermitidos.Contains(dto.Perfil))
            {
                return BadRequest("Perfil invalido.");
            }

            var usuarioExistente = await _firestoreService.ObterUsuarioPorMatriculaAsync(dto.Matricula);
            if (usuarioExistente != null)
            {
                return BadRequest($"Ja existe um usuario cadastrado com a matricula {dto.Matricula}.");
            }

            var novoUsuario = new Usuario
            {
                Matricula = dto.Matricula.Trim(),
                Nome = dto.Nome.Trim(),
                Perfil = dto.Perfil,
                DataNascimento = dto.DataNascimento.Trim(),
                Ativo = true,
                Email = dto.Email.Trim(),
                Telefone = dto.Telefone.Trim(),
                Setor = dto.Setor.Trim(),
                PrimeiroAcesso = string.IsNullOrWhiteSpace(dto.Email)
            };

            await _firestoreService.SalvarUsuarioAsync(novoUsuario);
            return Ok(new { mensagem = "Usuario cadastrado com sucesso.", usuario = novoUsuario });
        }

        [HttpGet]
        public async Task<IActionResult> ListarTodos()
        {
            var usuarios = await _firestoreService.ObterTodosUsuariosAsync();
            return Ok(usuarios);
        }

        [HttpGet("{matricula}")]
        public async Task<IActionResult> ObterPorMatricula(string matricula)
        {
            var usuario = await _firestoreService.ObterUsuarioPorMatriculaAsync(matricula);
            if (usuario == null)
            {
                return NotFound($"Usuario com matricula {matricula} nao foi encontrado.");
            }

            return Ok(usuario);
        }

        [HttpPut("{matricula}")]
        public async Task<IActionResult> AtualizarUsuario(string matricula, [FromBody] UsuarioUpdateDto dto)
        {
            if (!PerfisPermitidos.Contains(dto.Perfil))
            {
                return BadRequest("Perfil invalido.");
            }

            var usuarioExistente = await _firestoreService.ObterUsuarioPorMatriculaAsync(matricula);
            if (usuarioExistente == null)
            {
                return NotFound($"Usuario com matricula {matricula} nao encontrado para edicao.");
            }

            usuarioExistente.Nome = dto.Nome.Trim();
            usuarioExistente.Perfil = dto.Perfil;
            usuarioExistente.DataNascimento = dto.DataNascimento.Trim();
            usuarioExistente.Ativo = dto.Ativo;
            usuarioExistente.Email = dto.Email.Trim();
            usuarioExistente.Telefone = dto.Telefone.Trim();
            usuarioExistente.Setor = dto.Setor.Trim();
            usuarioExistente.PrimeiroAcesso = string.IsNullOrWhiteSpace(dto.Email);

            await _firestoreService.SalvarUsuarioAsync(usuarioExistente);
            return Ok(new { mensagem = "Usuario atualizado com sucesso.", usuario = usuarioExistente });
        }

        [HttpPatch("{matricula}/inativar")]
        public async Task<IActionResult> InativarUsuario(string matricula)
        {
            var usuarioExistente = await _firestoreService.ObterUsuarioPorMatriculaAsync(matricula);
            if (usuarioExistente == null)
            {
                return NotFound($"Usuario com matricula {matricula} nao encontrado para inativacao.");
            }

            usuarioExistente.Ativo = false;

            await _firestoreService.SalvarUsuarioAsync(usuarioExistente);
            return Ok(new { mensagem = "Usuario inativado com sucesso.", usuario = usuarioExistente });
        }

        [HttpDelete("{matricula}")]
        public async Task<IActionResult> ExcluirUsuario(string matricula)
        {
            var usuarioExistente = await _firestoreService.ObterUsuarioPorMatriculaAsync(matricula);
            if (usuarioExistente == null)
            {
                return NotFound($"Usuario com matricula {matricula} nao encontrado para exclusao.");
            }

            await _firestoreService.DeletarUsuarioAsync(matricula);
            return NoContent();
        }
    }
}
