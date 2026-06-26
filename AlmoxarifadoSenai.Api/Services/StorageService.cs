using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;

namespace AlmoxarifadoSenai.Api.Services
{
    public class StorageService
    {
        private readonly IConfiguration _configuration;

        public StorageService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task<(string url, string fileName)> SalvarImagemAsync(string base64Image, string demandaId, string nomeOriginal)
        {
            try
            {
                // Remove o cabeçalho "data:image/png;base64," se existir
                var base64Data = base64Image;
                if (base64Image.Contains(","))
                {
                    base64Data = base64Image.Substring(base64Image.IndexOf(",") + 1);
                }

                var imageBytes = Convert.FromBase64String(base64Data);

                // Gera nome único para o arquivo
                var extension = Path.GetExtension(nomeOriginal);
                if (string.IsNullOrEmpty(extension))
                {
                    extension = ".jpg";
                }

                var fileName = $"{demandaId}_{DateTime.Now:yyyyMMddHHmmss}_{Guid.NewGuid():N}{extension}";

                // Em ambiente de desenvolvimento, salva localmente
                var uploadDir = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", demandaId);
                if (!Directory.Exists(uploadDir))
                {
                    Directory.CreateDirectory(uploadDir);
                }

                var filePath = Path.Combine(uploadDir, fileName);
                await File.WriteAllBytesAsync(filePath, imageBytes);

                // Gera URL para acesso
                var url = $"/uploads/{demandaId}/{fileName}";

                Console.WriteLine($"📁 Arquivo salvo: {filePath}");
                Console.WriteLine($"🔗 URL: {url}");

                return (url, fileName);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Erro ao salvar imagem: {ex.Message}");
                throw;
            }
        }

        public async Task<bool> DeletarArquivoAsync(string url)
        {
            try
            {
                // Converte URL para caminho físico
                var relativePath = url.TrimStart('/');
                var filePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", relativePath);

                if (File.Exists(filePath))
                {
                    File.Delete(filePath);
                    Console.WriteLine($"🗑️ Arquivo deletado: {filePath}");
                    return true;
                }

                return false;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Erro ao deletar arquivo: {ex.Message}");
                return false;
            }
        }

        public async Task<byte[]?> ObterArquivoAsync(string url)
        {
            try
            {
                var relativePath = url.TrimStart('/');
                var filePath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", relativePath);

                if (File.Exists(filePath))
                {
                    return await File.ReadAllBytesAsync(filePath);
                }

                return null;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Erro ao ler arquivo: {ex.Message}");
                return null;
            }
        }
    }
}