using AlmoxarifadoSenai.Api.Constants;
using AlmoxarifadoSenai.Api.DTOs;
using AlmoxarifadoSenai.Api.Models;
using AlmoxarifadoSenai.Api.Services;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;

namespace AlmoxarifadoSenai.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")] 
    public class AuthController : ControllerBase
    {
        private readonly JwtService _jwtService;
        private readonly FirestoreService _firestoreService; // Injetando o serviço do Firestore

        public AuthController(JwtService jwtService, FirestoreService firestoreService)
        {
            _jwtService = jwtService;
            _firestoreService = firestoreService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            // Busca o usuário real no Firestore usando a matrícula digitada
            Usuario? usuario = await _firestoreService.ObterUsuarioPorMatriculaAsync(request.Matricula);

            if (usuario == null)
            {
                return Unauthorized("Usuário ou senha (data de nascimento) inválidos.");
            }

            //Verifica se o usuário está ativo no sistema
            if (!usuario.Ativo)
            {
                return Unauthorized("Este usuário está inativo no sistema. Procure o Administrador.");
            }

            // Validação da data de nascimento (comparando apenas as datas, sem as horas)
            if (request.DataNascimento.Date != usuario.DataNascimento.Date)
            {
                return Unauthorized("Usuário ou senha (data de nascimento) inválidos.");
            }

            // Gera o Token JWT real
            var token = _jwtService.GerarToken(usuario);

            return Ok(new
            {
                mensagem = "Login realizado com sucesso.",
                token,
                usuario = new
                {
                    usuario.Nome,
                    usuario.Matricula,
                    usuario.Perfil
                }
            });
        }
    }
}