using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AlmoxarifadoSenai.Api.DTOs
{
    public class LoginRequest
    {
        public string Matricula { get; set; } = string.Empty;
        public DateTime DataNascimento { get; set; }
    }
}