using AlmoxarifadoSenai.Api.Constants;
using AlmoxarifadoSenai.Api.DTOs;
using AlmoxarifadoSenai.Api.Models;
using AlmoxarifadoSenai.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace AlmoxarifadoSenai.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = Perfis.Admin)] // Proteção da Sprint 2: Apenas Admin acessa este CRUD
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
                DataNascimento = dto.DataNascimento,
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

            usuarioExistente.Nome = dto.Nome;
            usuarioExistente.Perfil = dto.Perfil;
            usuarioExistente.DataNascimento = dto.DataNascimento;
            usuarioExistente.Ativo = dto.Ativo;

            await _firestoreService.SalvarUsuarioAsync(usuarioExistente);
            return Ok(new { mensagem = "Usuário atualizado com sucesso!", usuario = usuarioExistente });
        }
    }
}