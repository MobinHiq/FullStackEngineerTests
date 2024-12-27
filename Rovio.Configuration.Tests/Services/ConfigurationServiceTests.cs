using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using Moq;
using Rovio.Configuration.Models.Dtos;
using Rovio.Configuration.Services;
using Xunit;

namespace Rovio.Configuration.Tests.Services
{
    public class ConfigurationServiceTests
    {
        private readonly Mock<IConfigurationRepository> _mockRepository;
        private readonly Mock<ILogger<ConfigurationService>> _mockLogger;
        private readonly IMemoryCache _cache;
        private readonly ConfigurationService _service;

        public ConfigurationServiceTests()
        {
            _mockRepository = new Mock<IConfigurationRepository>();
            _mockLogger = new Mock<ILogger<ConfigurationService>>();
            _cache = new MemoryCache(new MemoryCacheOptions());
            _service = new ConfigurationService(_mockRepository.Object, _cache, _mockLogger.Object);
        }

        [Fact]
        public async Task GetByIdAsync_WhenConfigExists_ReturnsConfig()
        {
            // Arrange
            var expectedConfig = new ConfigurationDto
            {
                Id = "1",
                Name = "TestConfig",
                JsonConfig = "{\"key\":\"value\"}",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _mockRepository.Setup(r => r.GetByIdAsync("1"))
                .ReturnsAsync(expectedConfig);

            // Act
            var result = await _service.GetByIdAsync("1");

            // Assert
            Assert.NotNull(result);
            Assert.Equal(expectedConfig.Id, result.Id);
            Assert.Equal(expectedConfig.Name, result.Name);
            Assert.Equal(expectedConfig.JsonConfig, result.JsonConfig);
        }

        [Fact]
        public async Task GetByIdAsync_WhenCached_ReturnsCachedConfig()
        {
            // Arrange
            var expectedConfig = new ConfigurationDto
            {
                Id = "1",
                Name = "TestConfig",
                JsonConfig = "{\"key\":\"value\"}",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _mockRepository.Setup(r => r.GetByIdAsync("1"))
                .ReturnsAsync(expectedConfig);

            // Act
            var firstResult = await _service.GetByIdAsync("1");
            var secondResult = await _service.GetByIdAsync("1");

            // Assert
            _mockRepository.Verify(r => r.GetByIdAsync("1"), Times.Once);
            Assert.Equal(firstResult.Id, secondResult.Id);
        }

        [Fact]
        public async Task CreateAsync_WithValidDto_CreatesAndReturnsConfig()
        {
            // Arrange
            var configToCreate = new ConfigurationDto
            {
                Name = "NewConfig",
                JsonConfig = "{\"key\":\"value\"}"
            };

            var createdConfig = new ConfigurationDto
            {
                Id = "1",
                Name = "NewConfig",
                JsonConfig = "{\"key\":\"value\"}",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _mockRepository.Setup(r => r.CreateAsync(It.IsAny<ConfigurationDto>()))
                .ReturnsAsync(createdConfig);

            // Act
            var result = await _service.CreateAsync(configToCreate);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(createdConfig.Id, result.Id);
            Assert.Equal(createdConfig.Name, result.Name);
            Assert.Equal(createdConfig.JsonConfig, result.JsonConfig);
        }

        [Fact]
        public async Task CreateAsync_WithNullName_ThrowsArgumentException()
        {
            // Arrange
            var configToCreate = new ConfigurationDto
            {
                Name = "",
                JsonConfig = "{\"key\":\"value\"}"
            };

            // Act & Assert
            await Assert.ThrowsAsync<ArgumentException>(() => 
                _service.CreateAsync(configToCreate));
        }

        [Fact]
        public async Task UpdateAsync_WithValidDto_UpdatesAndReturnsConfig()
        {
            // Arrange
            var configToUpdate = new ConfigurationDto
            {
                Id = "1",
                Name = "UpdatedConfig",
                JsonConfig = "{\"key\":\"newValue\"}"
            };

            var updatedConfig = new ConfigurationDto
            {
                Id = "1",
                Name = "UpdatedConfig",
                JsonConfig = "{\"key\":\"newValue\"}",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _mockRepository.Setup(r => r.UpdateAsync(It.IsAny<ConfigurationDto>()))
                .ReturnsAsync(updatedConfig);

            // Act
            var result = await _service.UpdateAsync(configToUpdate);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(updatedConfig.Id, result.Id);
            Assert.Equal(updatedConfig.Name, result.Name);
            Assert.Equal(updatedConfig.JsonConfig, result.JsonConfig);
        }

        [Fact]
        public async Task DeleteAsync_CallsRepositoryAndInvalidatesCache()
        {
            // Arrange
            _mockRepository.Setup(r => r.DeleteAsync("1"))
                .Returns(Task.CompletedTask);

            // Act
            await _service.DeleteAsync("1");

            // Assert
            _mockRepository.Verify(r => r.DeleteAsync("1"), Times.Once);

            // Verify cache is invalidated by trying to get the deleted item
            _mockRepository.Setup(r => r.GetByIdAsync("1"))
                .ReturnsAsync((ConfigurationDto)null);
            var result = await _service.GetByIdAsync("1");
            Assert.Null(result);
        }

        [Fact]
        public async Task ExistsAsync_WithValidKey_ReturnsExpectedResult()
        {
            // Arrange
            var key = "testKey";
            _mockRepository.Setup(r => r.ExistsAsync(key))
                .ReturnsAsync(true);

            // Act
            var result = await _service.ExistsAsync(key);

            // Assert
            Assert.True(result);
            _mockRepository.Verify(r => r.ExistsAsync(key), Times.Once);
        }
    }
} 