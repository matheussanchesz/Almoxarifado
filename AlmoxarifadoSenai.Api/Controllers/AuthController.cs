using AlmoxarifadoSenai.Api.DTOs;
using AlmoxarifadoSenai.Api.Models;
using AlmoxarifadoSenai.Api.Services;
using Grpc.Core;
using Microsoft.AspNetCore.Mvc;

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
            Console.WriteLine("TENTANDO LOGIN");
            Console.WriteLine($"Matricula: '{request.Matricula}'");
            Console.WriteLine($"Data informada: '{request.DataNascimento}'");
            Console.WriteLine("========================================");

            Usuario? usuario;

            try
            {
                usuario = await _firestoreService.ObterUsuarioPorMatriculaAsync(request.Matricula);
            }
            catch (RpcException ex) when (ex.StatusCode == Grpc.Core.StatusCode.Unauthenticated)
            {
                Console.WriteLine("ERRO FIREBASE: credenciais invalidas ou chave da service account revogada.");
                return StatusCode(503, "Credenciais do Firebase invalidas. Gere uma nova chave da service account e atualize o .env.");
            }

            if (usuario == null)
            {
                Console.WriteLine($"Usuario '{request.Matricula}' nao encontrado");
                return Unauthorized("Usuario ou senha (data de nascimento) invalidos.");
            }

            Console.WriteLine("Usuario encontrado:");
            Console.WriteLine($"   - Nome: {usuario.Nome}");
            Console.WriteLine($"   - Matricula: {usuario.Matricula}");
            Console.WriteLine($"   - Data no banco: '{usuario.DataNascimento}'");
            Console.WriteLine($"   - Perfil: {usuario.Perfil}");
            Console.WriteLine($"   - Ativo: {usuario.Ativo}");

            if (!usuario.Ativo)
            {
                return Unauthorized("Este usuario esta inativo no sistema. Procure o Administrador.");
            }

            if (request.DataNascimento != usuario.DataNascimento)
            {
                return Unauthorized("Usuario ou senha (data de nascimento) invalidos.");
            }

            var token = _jwtService.GerarToken(usuario);
            var precisaCompletarCadastro =
                usuario.PrimeiroAcesso || string.IsNullOrWhiteSpace(usuario.Email);

            return Ok(new
            {
                mensagem = "Login realizado com sucesso.",
                token,
                precisaCompletarCadastro,
                usuario = new
                {
                    usuario.Nome,
                    usuario.Matricula,
                    usuario.Perfil,
                    usuario.Email,
                    usuario.Telefone,
                    usuario.Setor,
                    usuario.PrimeiroAcesso
                }
            });
        }

        [HttpPost("completar-cadastro")]
        public async Task<IActionResult> CompletarCadastro([FromBody] CompletarCadastroDto request)
        {
            var usuario = await _firestoreService.ObterUsuarioPorMatriculaAsync(request.Matricula);
            if (usuario == null || request.DataNascimento != usuario.DataNascimento)
            {
                return Unauthorized("Dados invalidos para completar o cadastro.");
            }

            if (!usuario.Ativo)
            {
                return Unauthorized("Este usuario esta inativo no sistema.");
            }

            usuario.Email = request.Email.Trim();
            usuario.Telefone = request.Telefone.Trim();
            usuario.Setor = request.Setor.Trim();
            usuario.PrimeiroAcesso = false;

            await _firestoreService.SalvarUsuarioAsync(usuario);

            var token = _jwtService.GerarToken(usuario);

            return Ok(new
            {
                mensagem = "Cadastro atualizado com sucesso.",
                token,
                precisaCompletarCadastro = false,
                usuario = new
                {
                    usuario.Nome,
                    usuario.Matricula,
                    usuario.Perfil,
                    usuario.Email,
                    usuario.Telefone,
                    usuario.Setor,
                    usuario.PrimeiroAcesso
                }
            });
        }

        [HttpPost("recuperar-acesso")]
        public async Task<IActionResult> RecuperarAcesso([FromBody] RecuperarAcessoDto request)
        {
            var identificador = request.Identificador.Trim();
            var usuario = identificador.Contains("@")
                ? await _firestoreService.ObterUsuarioPorEmailAsync(identificador)
                : await _firestoreService.ObterUsuarioPorMatriculaAsync(identificador);

            if (usuario == null || !usuario.Ativo)
            {
                return NotFound("Nao encontramos um usuario ativo com os dados informados.");
            }

            if (string.IsNullOrWhiteSpace(usuario.Email))
            {
                return BadRequest("Este usuario ainda nao cadastrou e-mail. Acesse com a matricula e complete o primeiro acesso.");
            }

            return Ok(new
            {
                mensagem = $"Acesso localizado. Use sua matricula {usuario.Matricula} e a data de nascimento cadastrada para entrar. Se for o primeiro acesso, complete o cadastro com e-mail.",
                email = usuario.Email
            });
        }
    }
}
