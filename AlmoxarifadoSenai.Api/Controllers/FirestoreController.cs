using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AlmoxarifadoSenai.Api.Services;
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
        public IActionResult Testar()
        {
            return Ok("Firestore conectado!");
        }
    }
}