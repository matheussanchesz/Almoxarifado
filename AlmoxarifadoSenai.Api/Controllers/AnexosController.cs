using System.Security.Claims;
using AlmoxarifadoSenai.Api.Constants;
using AlmoxarifadoSenai.Api.DTOs;
using AlmoxarifadoSenai.Api.Models;
using AlmoxarifadoSenai.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace AlmoxarifadoSenai.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class AnexosController : ControllerBase
    {
        private readonly FirestoreService _firestoreService;
        private readonly StorageService _storageService;

        public AnexosController(FirestoreService firestoreService, StorageService storageService)
        {
            _firestoreService = firestoreService;
            _storageService = storageService;
        }

        [HttpPost("upload")]
        public async Task<IActionResult> UploadAnexo([FromBody] AnexoUploadDto dto)
        {
            var usuarioMatricula = User.FindFirst("Matricula")?.Value ?? string.Empty;
            var usuarioNome = User.FindFirst(ClaimTypes.Name)?.Value ?? string.Empty;

            // Verifica se a demanda existe
            var demanda = await _firestoreService.ObterDemandaPorIdAsync(dto.DemandaId);
            if (demanda == null)
            {
                return NotFound($"Demanda com ID {dto.DemandaId} não encontrada.");
            }

            try
            {
                // Salva a imagem
                var (url, fileName) = await _storageService.SalvarImagemAsync(
                    dto.Base64Image,
                    dto.DemandaId,
                    dto.NomeArquivo
                );

                var anexo = new Anexo
                {
                    DemandaId = dto.DemandaId,
                    ChecklistId = dto.ChecklistId,
                    ExecucaoChecklistId = dto.ExecucaoChecklistId,
                    NomeArquivo = fileName,
                    Url = url,
                    Tipo = dto.Tipo,
                    MimeType = "image/jpeg",
                    UsuarioMatricula = usuarioMatricula,
                    UsuarioNome = usuarioNome,
                    Tamanho = dto.Base64Image.Length / 1024 // Tamanho aproximado em KB
                };

                await _firestoreService.SalvarAnexoAsync(anexo);

                // ⭐ CORREÇÃO: Registrar histórico diretamente
                await RegistrarHistoricoDemandaAsync(demanda.Id, "AdicionouAnexo", $"Adicionou anexo: {fileName}");

                return Ok(new
                {
                    mensagem = "Anexo enviado com sucesso!",
                    anexo = new AnexoDto
                    {
                        Id = anexo.Id,
                        DemandaId = anexo.DemandaId,
                        NomeArquivo = anexo.NomeArquivo,
                        Url = anexo.Url,
                        Tipo = anexo.Tipo,
                        MimeType = anexo.MimeType,
                        UsuarioNome = anexo.UsuarioNome,
                        DataUpload = anexo.DataUpload,
                        Tamanho = anexo.Tamanho
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { mensagem = $"Erro ao enviar anexo: {ex.Message}" });
            }
        }

        [HttpGet("demanda/{demandaId}")]
        public async Task<IActionResult> ObterAnexosPorDemanda(string demandaId)
        {
            var anexos = await _firestoreService.ObterAnexosPorDemandaAsync(demandaId);
            return Ok(anexos.Select(a => new AnexoDto
            {
                Id = a.Id,
                DemandaId = a.DemandaId,
                NomeArquivo = a.NomeArquivo,
                Url = a.Url,
                Tipo = a.Tipo,
                MimeType = a.MimeType,
                UsuarioNome = a.UsuarioNome,
                DataUpload = a.DataUpload,
                Tamanho = a.Tamanho
            }));
        }

        [HttpGet("{id}/download")]
        public async Task<IActionResult> DownloadAnexo(string id)
        {
            var anexo = await _firestoreService.ObterAnexoPorIdAsync(id);
            if (anexo == null)
            {
                return NotFound($"Anexo com ID {id} não encontrado.");
            }

            var arquivo = await _storageService.ObterArquivoAsync(anexo.Url);
            if (arquivo == null)
            {
                return NotFound("Arquivo não encontrado no servidor.");
            }

            return File(arquivo, anexo.MimeType, anexo.NomeArquivo);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = $"{Perfis.Admin},{Perfis.Almoxarife}")]
        public async Task<IActionResult> DeletarAnexo(string id)
        {
            var anexo = await _firestoreService.ObterAnexoPorIdAsync(id);
            if (anexo == null)
            {
                return NotFound($"Anexo com ID {id} não encontrado.");
            }

            // Deleta o arquivo físico
            await _storageService.DeletarArquivoAsync(anexo.Url);

            // Deleta o registro
            await _firestoreService.DeletarAnexoAsync(id);

            // ⭐ CORREÇÃO: Registrar histórico
            await RegistrarHistoricoDemandaAsync(anexo.DemandaId, "RemoveuAnexo", $"Removeu anexo: {anexo.NomeArquivo}");

            return Ok(new { mensagem = "Anexo excluído com sucesso!" });
        }

        // ⭐ MÉTODO AUXILIAR PARA REGISTRAR HISTÓRICO
        private async Task RegistrarHistoricoDemandaAsync(string demandaId, string acao, string detalhes)
        {
            try
            {
                var usuarioMatricula = User.FindFirst("Matricula")?.Value ?? string.Empty;
                var usuarioNome = User.FindFirst(ClaimTypes.Name)?.Value ?? string.Empty;
                var usuarioPerfil = User.FindFirst(ClaimTypes.Role)?.Value ?? string.Empty;

                var historico = new HistoricoDemanda
                {
                    DemandaId = demandaId,
                    UsuarioMatricula = usuarioMatricula,
                    UsuarioNome = usuarioNome,
                    UsuarioPerfil = usuarioPerfil,
                    Acao = acao,
                    Detalhes = detalhes,
                    DataHora = DateTime.UtcNow
                };

                await _firestoreService.SalvarHistoricoAsync(historico);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Erro ao registrar histórico: {ex.Message}");
            }
        }
    }
}