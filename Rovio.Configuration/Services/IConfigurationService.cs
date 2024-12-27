using Rovio.Configuration.Models.Dtos;

namespace Rovio.Configuration.Services
{
    public interface IConfigurationService
    {
        Task<ConfigurationDto> GetByIdAsync(string id);
        Task<IEnumerable<ConfigurationDto>> GetAllAsync();
        Task<ConfigurationDto> CreateAsync(ConfigurationDto configurationDto);
        Task<ConfigurationDto> UpdateAsync(ConfigurationDto configurationDto);
        Task DeleteAsync(string id);
        Task<bool> ExistsAsync(string key);
    }
} 