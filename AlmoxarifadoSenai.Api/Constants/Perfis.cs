using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AlmoxarifadoSenai.Api.Constants
{
    public static class Perfis
    {
        public const string Admin = "Admin";
        public const string Desenvolvedor = "Desenvolvedor";
        public const string Coordenador = "Coordenador";
        public const string Professor = "Professor";
        public const string Almoxarife = "Almoxarife";
        public const string Almoxarifado = "Almoxarifado";
        public const string OperacaoAlmoxarifado = Almoxarife + "," + Almoxarifado;

        public static readonly string[] Todos =
        {
            Admin,
            Coordenador,
            Professor,
            Almoxarife,
            Almoxarifado
        };
    }
}
