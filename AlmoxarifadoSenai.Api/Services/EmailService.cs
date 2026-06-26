using System;
using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;
using AlmoxarifadoSenai.Api.Models;

namespace AlmoxarifadoSenai.Api.Services
{
    public class EmailService
    {
        private readonly IConfiguration _configuration;

        public EmailService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task<bool> EnviarEmailSolicitacaoCompraAsync(SolicitacaoCompra solicitacao)
        {
            try
            {
                // Configurações do SMTP
                var smtpHost = _configuration["Email:SmtpHost"] ?? "smtp.gmail.com";
                var smtpPort = int.Parse(_configuration["Email:SmtpPort"] ?? "587");
                var smtpUser = _configuration["Email:SmtpUser"] ?? "almoxarifado@senai.com";
                var smtpPass = _configuration["Email:SmtpPass"] ?? "senha_temp";

                using var client = new SmtpClient(smtpHost, smtpPort);
                client.EnableSsl = true;
                client.Credentials = new NetworkCredential(smtpUser, smtpPass);

                // Corpo do e-mail
                var assunto = $"[COMPRAS ALMOXARIFADO AUTOMOTIVO] Prioridade: {solicitacao.Urgencia} - {solicitacao.Categoria} - {solicitacao.NomeItem}";

                var corpo = $@"
                    <h2>Solicitação de Compra</h2>
                    <p><strong>Categoria:</strong> {solicitacao.Categoria}</p>
                    <p><strong>Item:</strong> {solicitacao.NomeItem}</p>
                    <p><strong>Especificação:</strong> {solicitacao.Especificacao}</p>
                    <p><strong>Quantidade:</strong> {solicitacao.Quantidade}</p>
                    <p><strong>Urgência:</strong> {solicitacao.Urgencia}</p>
                    <p><strong>Justificativa:</strong> {solicitacao.Justificativa}</p>
                    <p><strong>Solicitante:</strong> {solicitacao.AlmoxarifeNome} ({solicitacao.AlmoxarifeMatricula})</p>
                    <p><strong>Data:</strong> {solicitacao.DataSolicitacao:dd/MM/yyyy HH:mm}</p>
                    <hr>
                    <p><small>Esta é uma mensagem automática do Sistema de Almoxarifado SENAI Automotivo</small></p>
                ";

                // Destinatários
                var emailComprador = _configuration["Email:Comprador"] ?? "compras@senai.com";
                var emailCoordenador = _configuration["Email:Coordenador"] ?? "coordenador@senai.com";

                var mensagem = new MailMessage
                {
                    From = new MailAddress(smtpUser, "Sistema Almoxarifado SENAI"),
                    Subject = assunto,
                    Body = corpo,
                    IsBodyHtml = true
                };

                mensagem.To.Add(emailComprador);
                mensagem.CC.Add(emailCoordenador);

                // Em ambiente de desenvolvimento, apenas loga
                Console.WriteLine("========================================");
                Console.WriteLine($"📧 E-MAIL DE SOLICITAÇÃO DE COMPRA");
                Console.WriteLine($"   Para: {emailComprador}");
                Console.WriteLine($"   CC: {emailCoordenador}");
                Console.WriteLine($"   Assunto: {assunto}");
                Console.WriteLine($"   Corpo: {corpo}");
                Console.WriteLine("========================================");

                // Em produção, enviar e-mail
                // await client.SendMailAsync(mensagem);

                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Erro ao enviar e-mail: {ex.Message}");
                return false;
            }
        }
    }
}