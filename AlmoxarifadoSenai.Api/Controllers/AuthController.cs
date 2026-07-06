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
        private readonly FirestoreService _firestoreService;

        public AuthController(JwtService jwtService, FirestoreService firestoreService)
        {
            _jwtService = jwtService;
            _firestoreService = firestoreService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            Console.WriteLine("========================================");
            Console.WriteLine($"🔐 TENTANDO LOGIN");
            Console.WriteLine($"📝 Matrícula: '{request.Matricula}'");
            Console.WriteLine($"📝 Data informada: '{request.DataNascimento}'");
            Console.WriteLine("========================================");

            // Busca o usuário no Firestore
            Usuario? usuario = await _firestoreService.ObterUsuarioPorMatriculaAsync(request.Matricula);

            if (usuario == null)
            {
                Console.WriteLine($"❌ Usuário '{request.Matricula}' NÃO ENCONTRADO");
                return Unauthorized("Usuário ou senha (data de nascimento) inválidos.");
            }

            Console.WriteLine($"✅ Usuário ENCONTRADO:");
            Console.WriteLine($"   - Nome: {usuario.Nome}");
            Console.WriteLine($"   - Matrícula: {usuario.Matricula}");
            Console.WriteLine($"   - Data no banco: '{usuario.DataNascimento}'");
            Console.WriteLine($"   - Perfil: {usuario.Perfil}");
            Console.WriteLine($"   - Ativo: {usuario.Ativo}");

            if (!usuario.Ativo)
            {
                Console.WriteLine($"❌ Usuário está INATIVO");
                return Unauthorized("Este usuário está inativo no sistema. Procure o Administrador.");
            }

            Console.WriteLine($"🔍 Comparando: '{request.DataNascimento}' == '{usuario.DataNascimento}'");

            if (request.DataNascimento != usuario.DataNascimento)
            {
                Console.WriteLine($"❌ DATAS NÃO COINCIDEM!");
                return Unauthorized("Usuário ou senha (data de nascimento) inválidos.");
            }

            Console.WriteLine($"✅ LOGIN BEM SUCEDIDO para {usuario.Nome}!");

            // Gera o Token JWT
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