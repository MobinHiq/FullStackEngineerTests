using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using Rovio.Configuration.Models.Dtos;
using System.Text.Json;

namespace Rovio.Configuration.Services
{
    public class ConfigurationService : IConfigurationService
    {
        private readonly IConfigurationRepository _configurationRepository;
        private readonly IMemoryCache _cache;
        private readonly ILogger<ConfigurationService> _logger;
        private readonly TimeSpan _cacheDuration = TimeSpan.FromMinutes(5);

        public ConfigurationService(
            IConfigurationRepository configurationRepository,
            IMemoryCache cache,
            ILogger<ConfigurationService> logger)
        {
            _configurationRepository = configurationRepository;
            _cache = cache;
            _logger = logger;
        }

        public async Task<ConfigurationDto> GetByIdAsync(string id)
        {
            var cacheKey = $"config:{id}";
            
            if (_cache.TryGetValue<ConfigurationDto>(cacheKey, out var cachedValue))
            {
                _logger.LogDebug("Cache hit for id: {Id}", id);
                return cachedValue;
            }

            _logger.LogDebug("Cache miss for id: {Id}", id);
            var value = await _configurationRepository.GetByIdAsync(id);
            
            if (value != null)
            {
                _cache.Set(cacheKey, value, _cacheDuration);
            }

            return value;
        }

        public async Task<IEnumerable<ConfigurationDto>> GetAllAsync()
        {
            _logger.LogDebug("Retrieving all configurations");
            return await _configurationRepository.GetAllAsync();
        }

        public async Task<ConfigurationDto> CreateAsync(ConfigurationDto configurationDto)
        {
            if (configurationDto == null)
            {
                throw new ArgumentNullException(nameof(configurationDto));
            }

            if (string.IsNullOrEmpty(configurationDto.Name))
            {
                throw new ArgumentException("Name cannot be null or empty", nameof(configurationDto));
            }

            if (string.IsNullOrEmpty(configurationDto.JsonConfig))
            {
                throw new ArgumentException("JsonConfig cannot be null or empty", nameof(configurationDto));
            }

            try
            {
                // Validate JSON format
                JsonDocument.Parse(configurationDto.JsonConfig);
            }
            catch (JsonException)
            {
                throw new ArgumentException("Invalid JSON format in JsonConfig", nameof(configurationDto));
            }

            _logger.LogInformation("Creating configuration with name: {Name}", configurationDto.Name);
            
            configurationDto.CreatedAt = DateTime.UtcNow;
            configurationDto.UpdatedAt = DateTime.UtcNow;
            
            var result = await _configurationRepository.CreateAsync(configurationDto);
            InvalidateCache(result.Id.ToString());
            
            return result;
        }

        public async Task<ConfigurationDto> UpdateAsync(ConfigurationDto configurationDto)
        {
            if (configurationDto == null)
            {
                throw new ArgumentNullException(nameof(configurationDto));
            }

            if (string.IsNullOrEmpty(configurationDto.Name))
            {
                throw new ArgumentException("Name cannot be null or empty", nameof(configurationDto));
            }

            _logger.LogInformation("Updating configuration with id: {Id}", configurationDto.Id);
            
            configurationDto.UpdatedAt = DateTime.UtcNow;
            
            var result = await _configurationRepository.UpdateAsync(configurationDto);
            InvalidateCache(result.Id.ToString());
            
            return result;
        }

        public async Task DeleteAsync(string id)
        {
            _logger.LogInformation("Deleting configuration with id: {Id}", id);
            
            await _configurationRepository.DeleteAsync(id);
            InvalidateCache(id);
        }

        public async Task<bool> ExistsAsync(string key)
        {
            if (string.IsNullOrEmpty(key))
            {
                throw new ArgumentException("Key cannot be null or empty", nameof(key));
            }

            return await _configurationRepository.ExistsAsync(key);
        }

        private void InvalidateCache(string id)
        {
            var cacheKey = $"config:{id}";
            _cache.Remove(cacheKey);
        }
    }
} 