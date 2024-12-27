using Microsoft.EntityFrameworkCore;
using Rovio.Configuration.Models.Dtos;
using Rovio.Configuration.Repositories.Mapping;
using Xunit;

namespace Rovio.Configuration.Repositories.Tests
{
    public class ConfigurationRepositoryTests : IDisposable
    {
        private readonly DbContextOptions<ConfigurationDbContext> _options;
        private readonly ConfigurationDbContext _context;
        private readonly ConfigurationRepository _repository;
        private readonly ConfigurationMapper _configurationMapper;

        public ConfigurationRepositoryTests()
        {
            _options = new DbContextOptionsBuilder<ConfigurationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _context = new ConfigurationDbContext(_options);
            _configurationMapper = new ConfigurationMapper();
            _repository = new ConfigurationRepository(_context, _configurationMapper);
        }

        [Fact]
        public async Task GetByIdAsync_ShouldReturnNull_WhenConfigurationDoesNotExist()
        {
            // Act
            var result = await _repository.GetByIdAsync("999");

            // Assert
            Assert.Null(result);
        }

        [Fact]
        public async Task GetByIdAsync_ShouldReturnConfiguration_WhenExists()
        {
            // Arrange
            var config = new ConfigurationEntity
            {
                Id = "1",
                Name = "TestConfig",
                JsonConfig = "{\"key\":\"value\"}",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            await _context.Configurations.AddAsync(config);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.GetByIdAsync("1");

            // Assert
            Assert.NotNull(result);
            Assert.Equal(config.Name, result.Name);
            Assert.Equal(config.JsonConfig, result.JsonConfig);
        }

        [Fact]
        public async Task GetAllAsync_ShouldReturnAllConfigurations()
        {
            // Arrange
            var configs = new List<ConfigurationEntity>
            {
                new()
                {
                    Id = "1",
                    Name = "Config1",
                    JsonConfig = "{\"key1\":\"value1\"}",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                },
                new()
                {
                    Id = "2",
                    Name = "Config2",
                    JsonConfig = "{\"key2\":\"value2\"}",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                }
            };
            await _context.Configurations.AddRangeAsync(configs);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.GetAllAsync();

            // Assert
            Assert.Equal(2, result.Count());
            Assert.Contains(result, c => c.Name == "Config1");
            Assert.Contains(result, c => c.Name == "Config2");
        }

        [Fact]
        public async Task CreateAsync_ShouldCreateNewConfiguration()
        {
            // Arrange
            var configDto = new ConfigurationDto
            {
                Name = "NewConfig",
                JsonConfig = "{\"key\":\"value\"}",
            };

            // Act
            var result = await _repository.CreateAsync(configDto);

            // Assert
            Assert.NotNull(result);
            Assert.NotNull(result.Id);
            Assert.Equal(configDto.Name, result.Name);
            Assert.Equal(configDto.JsonConfig, result.JsonConfig);
            Assert.NotEqual(default, result.CreatedAt);
            Assert.NotEqual(default, result.UpdatedAt);

            var savedConfig = await _context.Configurations.FindAsync(result.Id);
            Assert.NotNull(savedConfig);
            Assert.Equal(configDto.Name, savedConfig.Name);
        }

        [Fact]
        public async Task UpdateAsync_ShouldUpdateExistingConfiguration()
        {
            // Arrange
            var id = Guid.NewGuid().ToString();
            var initialTime = DateTime.UtcNow;
            var config = new ConfigurationEntity
            {
                Id = id,
                Name = "TestConfig",
                JsonConfig = "{\"key\":\"value\"}",
                CreatedAt = initialTime,
                UpdatedAt = initialTime
            };
            await _context.Configurations.AddAsync(config);
            await _context.SaveChangesAsync();

            // Add a small delay to ensure UpdatedAt will be different
            await Task.Delay(10); // Increased delay to ensure timestamp difference

            var updateDto = new ConfigurationDto
            {
                Id = id,
                Name = "UpdatedConfig",
                JsonConfig = "{\"key\":\"newValue\"}",
            };

            // Act
            var result = await _repository.UpdateAsync(updateDto);

            // Assert
            Assert.NotNull(result);
            Assert.Equal(updateDto.Name, result.Name);
            Assert.Equal(updateDto.JsonConfig, result.JsonConfig);
            Assert.Equal(config.CreatedAt, result.CreatedAt);
            Assert.True(result.UpdatedAt > initialTime, 
                $"UpdatedAt ({result.UpdatedAt}) should be later than original timestamp ({initialTime})");

            var updatedConfig = await _context.Configurations.FindAsync(id);
            Assert.NotNull(updatedConfig);
            Assert.Equal(updateDto.Name, updatedConfig.Name);
            Assert.True(updatedConfig.UpdatedAt > initialTime, 
                $"UpdatedAt ({updatedConfig.UpdatedAt}) should be later than original timestamp ({initialTime})");
        }

        [Fact]
        public async Task DeleteAsync_ShouldRemoveConfiguration()
        {
            // Arrange
            var id = Guid.NewGuid().ToString();
            var config = new ConfigurationEntity
            {
                Id = id,
                Name = "TestConfig",
                JsonConfig = "{\"key\":\"value\"}",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            await _context.Configurations.AddAsync(config);
            await _context.SaveChangesAsync();

            // Act
            await _repository.DeleteAsync(id);

            // Assert
            var deletedConfig = await _context.Configurations.FindAsync(id);
            Assert.Null(deletedConfig);
        }

        [Fact]
        public async Task ExistsAsync_ShouldReturnTrue_WhenConfigurationExists()
        {
            // Arrange
            var id = Guid.NewGuid().ToString();
            var config = new ConfigurationEntity
            {
                Id = id,
                Name = "TestConfig",
                JsonConfig = "{\"key\":\"value\"}",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            await _context.Configurations.AddAsync(config);
            await _context.SaveChangesAsync();

            // Act
            var result = await _repository.ExistsAsync("TestConfig");

            // Assert
            Assert.True(result);
        }

        [Fact]
        public async Task ExistsAsync_ShouldReturnFalse_WhenConfigurationDoesNotExist()
        {
            // Act
            var result = await _repository.ExistsAsync("NonExistentConfig");

            // Assert
            Assert.False(result);
        }

        [Fact]
        public async Task CreateAsync_ShouldThrowException_WhenNameAlreadyExists()
        {
            // Arrange
            var existingConfig = new ConfigurationEntity
            {
                Id = Guid.NewGuid().ToString(),
                Name = "TestConfig",
                JsonConfig = "{\"key\":\"value\"}",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            await _context.Configurations.AddAsync(existingConfig);
            await _context.SaveChangesAsync();

            var configDto = new ConfigurationDto
            {
                Name = "TestConfig",
                JsonConfig = "{\"key\":\"value\"}"
            };

            // Act & Assert
            await Assert.ThrowsAsync<InvalidOperationException>(() => 
                _repository.CreateAsync(configDto));
        }

        public void Dispose()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }
    }
}