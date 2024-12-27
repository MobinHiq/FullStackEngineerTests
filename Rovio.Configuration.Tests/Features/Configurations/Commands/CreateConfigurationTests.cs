using Moq;
using Rovio.Configuration.Features.Configurations.Commands;
using Rovio.Configuration.Models.Dtos;
using Rovio.Configuration.Services;
using Xunit;

namespace Rovio.Configuration.Tests.Features.Configurations.Commands
{
    public class CreateConfigurationTests
    {
        private readonly Mock<IConfigurationService> _mockService;
        private readonly CreateConfiguration.Handler _handler;

        public CreateConfigurationTests()
        {
            _mockService = new Mock<IConfigurationService>();
            _handler = new CreateConfiguration.Handler(_mockService.Object);
        }

        [Fact]
        public async Task Handle_ReturnsSuccessResponse_WhenCreationSucceeds()
        {
            // Arrange
            var command = new CreateConfiguration.Command("TestConfig", "{}");
            var expectedConfig = new ConfigurationDto 
            { 
                Id = "1", 
                Name = "TestConfig", 
                JsonConfig = "{}" 
            };
            
            _mockService.Setup(s => s.CreateAsync(It.IsAny<ConfigurationDto>()))
                .ReturnsAsync(expectedConfig);

            // Act
            var response = await _handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.True(response.Success);
            Assert.NotNull(response.Data);
            Assert.Equal(expectedConfig.Name, response.Data.Name);
        }

        [Fact]
        public async Task Handle_ReturnsFailureResponse_WhenNameAlreadyExists()
        {
            // Arrange
            var command = new CreateConfiguration.Command("ExistingConfig", "{}");
            
            _mockService.Setup(s => s.CreateAsync(It.IsAny<ConfigurationDto>()))
                .ThrowsAsync(new InvalidOperationException("Configuration already exists"));

            // Act
            var response = await _handler.Handle(command, CancellationToken.None);

            // Assert
            Assert.False(response.Success);
            Assert.Contains("already exists", response.Message);
        }
    }
} 