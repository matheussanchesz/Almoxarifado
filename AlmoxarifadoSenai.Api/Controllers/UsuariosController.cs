using AlmoxarifadoSenai.Api.Constants;
using AlmoxarifadoSenai.Api.DTOs;
using AlmoxarifadoSenai.Api.Models;
using AlmoxarifadoSenai.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;

namespace AlmoxarifadoSenai.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = Perfis.Admin + "," + Perfis.Coordenador)]
    public class UsuariosController : ControllerBase
    {
        private readonly FirestoreService _firestoreService;

        public UsuariosController(FirestoreService firestoreService)
        {
            _firestoreService = firestoreService;
        }

        // 1. CADASTRO USUÁRIO
        [HttpPost]
        public async Task<IActionResult> CriarUsuario([FromBody] UsuarioCreateDto dto)
        {
            if (EhPerfilDesenvolvedor(dto.Perfil))
            {
                return Forbid();
            }

            var usuarioExistente = await _firestoreService.ObterUsuarioPorMatriculaAsync(dto.Matricula);
            if (usuarioExistente != null)
            {
                return BadRequest($"Já existe um usuário cadastrado com a matrícula {dto.Matricula}.");
            }

            var novoUsuario = new Usuario
            {
                Matricula = dto.Matricula,
                Nome = dto.Nome,
                Perfil = dto.Perfil,
                DataNascimento = dto.DataNascimento, // Agora é string
                Ativo = true
            };

            await _firestoreService.SalvarUsuarioAsync(novoUsuario);
            return Ok(new { mensagem = "Usuário cadastrado com sucesso!", usuario = novoUsuario });
        }

        // 2. LISTAR TODOS
        [HttpGet]
        public async Task<IActionResult> ListarTodos()
        {
            var usuarios = await _firestoreService.ObterTodosUsuariosAsync();

            if (EhCoordenadorLogado())
            {
                usuarios = usuarios
                    .Where(usuario => !EhPerfilDesenvolvedor(usuario.Perfil))
                    .ToList();
            }

            return Ok(usuarios);
        }

        // 3. BUSCAR POR MATRÍCULA
        [HttpGet("{matricula}")]
        public async Task<IActionResult> ObterPorMatricula(string matricula)
        {
            var usuario = await _firestoreService.ObterUsuarioPorMatriculaAsync(matricula);
            if (usuario == null)
            {
                return NotFound($"Usuário com matrícula {matricula} não foi encontrado.");
            }
            if (EhPerfilDesenvolvedor(usuario.Perfil) && EhCoordenadorLogado())
            {
                return NotFound($"Usuário com matrícula {matricula} não foi encontrado.");
            }
            return Ok(usuario);
        }

        // 4. EDITAR / INATIVAR
        [HttpPut("{matricula}")]
        public async Task<IActionResult> AtualizarUsuario(string matricula, [FromBody] UsuarioUpdateDto dto)
        {
            var usuarioExistente = await _firestoreService.ObterUsuarioPorMatriculaAsync(matricula);
            if (usuarioExistente == null)
            {
                return NotFound($"Usuário com matrícula {matricula} não encontrado para edição.");
            }

            if (EhPerfilDesenvolvedor(usuarioExistente.Perfil) || EhPerfilDesenvolvedor(dto.Perfil))
            {
                return Forbid();
            }

            usuarioExistente.Nome = dto.Nome;
            usuarioExistente.Perfil = dto.Perfil;
            usuarioExistente.DataNascimento = dto.DataNascimento;
            usuarioExistente.Ativo = dto.Ativo;

            await _firestoreService.SalvarUsuarioAsync(usuarioExistente);
            return Ok(new { mensagem = "Usuário atualizado com sucesso!", usuario = usuarioExistente });
        }
        [HttpPatch("{matricula}/inativar")]
        public async Task<IActionResult> InativarUsuario(string matricula)
        {
            var usuarioExistente = await _firestoreService.ObterUsuarioPorMatriculaAsync(matricula);
            if (usuarioExistente == null)
            {
                return NotFound($"Usuario com matricula {matricula} nao encontrado para inativacao.");
            }

            if (EhPerfilDesenvolvedor(usuarioExistente.Perfil))
            {
                return Forbid();
            }

            usuarioExistente.Ativo = false;

            await _firestoreService.SalvarUsuarioAsync(usuarioExistente);
            return Ok(new { mensagem = "Usuario inativado com sucesso!", usuario = usuarioExistente });
        }

        [HttpDelete("{matricula}")]
        public async Task<IActionResult> ExcluirUsuario(string matricula)
        {
            var usuarioExistente = await _firestoreService.ObterUsuarioPorMatriculaAsync(matricula);
            if (usuarioExistente == null)
            {
                return NotFound($"Usuario com matricula {matricula} nao encontrado para exclusao.");
            }

            if (EhPerfilDesenvolvedor(usuarioExistente.Perfil))
            {
                return Forbid();
            }

            await _firestoreService.DeletarUsuarioAsync(matricula);
            return NoContent();
        }

        private static bool EhPerfilDesenvolvedor(string? perfil) =>
            string.Equals(perfil?.Trim(), Perfis.Desenvolvedor, StringComparison.OrdinalIgnoreCase);

        private bool EhCoordenadorLogado() =>
            string.Equals(
                User.FindFirst(ClaimTypes.Role)?.Value,
                Perfis.Coordenador,
                StringComparison.OrdinalIgnoreCase);
    }

    
}
