using AlmoxarifadoSenai.Api.Services;
using Grpc.Core;
using Microsoft.AspNetCore.Mvc;

namespace AlmoxarifadoSenai.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FirestoreController : ControllerBase
    {
        private readonly FirestoreService _firestoreService;

        public FirestoreController(FirestoreService firestoreService)
        {
            _firestoreService = firestoreService;
        }

        [HttpGet]
        public async Task<IActionResult> Testar()
        {
            try
            {
                var snapshot = await _firestoreService
                    .GetDatabase()
                    .Collection("usuarios")
                    .Limit(1)
                    .GetSnapshotAsync();

                return Ok(new
                {
                    mensagem = "Firestore autenticado com sucesso!",
                    documentosTeste = snapshot.Count
                });
            }
            catch (RpcException ex) when (ex.StatusCode == Grpc.Core.StatusCode.Unauthenticated)
            {
                return StatusCode(503, "Credenciais do Firebase invalidas. Gere uma nova chave da service account e atualize o .env.");
            }
        }
    }
}
