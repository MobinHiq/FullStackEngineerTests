using MediatR;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using Rovio.Configuration.Common;
using Rovio.Configuration.Features.Configurations.Commands;
using Rovio.Configuration.Features.Configurations.Queries;
using Rovio.Configuration.Models.Dtos;
using Rovio.Configuration.Net.Controllers;
using Xunit;

namespace Rovio.Configuration.Net.Tests.Controllers
{
    public class ConfigurationControllerTests
    {
        private readonly Mock<IMediator> _mockMediator;
        private readonly Mock<ILogger<ConfigurationController>> _mockLogger;
        private readonly ConfigurationController _controller;

        public ConfigurationControllerTests()
        {
            _mockMediator = new Mock<IMediator>();
            _mockLogger = new Mock<ILogger<ConfigurationController>>();
            _controller = new ConfigurationController(_mockMediator.Object, _mockLogger.Object);
        }

        [Fact]
        public async Task GetAll_ReturnsOkResult_WithConfigurations()
        {
            // Arrange
            var configurations = new List<ConfigurationDto>
            {
                new() { Id = "1", Name = "Config1", JsonConfig = "{}" },
                new() { Id = "2", Name = "Config2", JsonConfig = "{}" }
            };

            var response = new BaseResponse<IEnumerable<ConfigurationDto>> { Data = configurations };
            _mockMediator.Setup(m => m.Send(It.IsAny<GetAllConfigurations.Query>(), default))
                .ReturnsAsync(response);

            // Act
            var result = await _controller.GetAll() as ObjectResult;

            // Assert
            Assert.NotNull(result);
            Assert.Equal(200, result.StatusCode);
            var returnedConfigs = Assert.IsType<List<ConfigurationDto>>(result.Value);
            Assert.Equal(2, returnedConfigs.Count);
        }

        [Fact]
        public async Task GetById_ReturnsOkResult_WhenConfigurationExists()
        {
            // Arrange
            var config = new ConfigurationDto { Id = "1", Name = "TestConfig", JsonConfig = "{}" };
            var response = new BaseResponse<ConfigurationDto> { Data = config };

            _mockMediator.Setup(m => m.Send(It.IsAny<GetConfiguration.Query>(), default))
                .ReturnsAsync(response);

            // Act
            var actionResult = await _controller.GetById("1");
            var result = actionResult.Result as OkObjectResult;

            // Assert
            Assert.NotNull(result);
            Assert.Equal(200, result.StatusCode);
            var returnedConfig = Assert.IsType<ConfigurationDto>(result.Value);
            Assert.Equal("TestConfig", returnedConfig.Name);
        }

        [Fact]
        public async Task GetById_ReturnsNotFound_WhenConfigurationDoesNotExist()
        {
            // Arrange
            var response = new BaseResponse<ConfigurationDto> 
            { 
                Success = false,
                Message = "Not found"
            };

            _mockMediator.Setup(m => m.Send(It.IsAny<GetConfiguration.Query>(), default))
                .ReturnsAsync(response);

            // Act
            var actionResult = await _controller.GetById("1");
            var result = actionResult.Result as NotFoundObjectResult;

            // Assert
            Assert.NotNull(result);
            Assert.Equal(404, result.StatusCode);
        }

        [Fact]
        public async Task Create_ReturnsCreatedAtAction_WhenSuccessful()
        {
            // Arrange
            var command = new CreateConfiguration.Command("NewConfig", "{}");
            var createdConfig = new ConfigurationDto { Id = "1", Name = "NewConfig", JsonConfig = "{}" };
            var response = new BaseResponse<ConfigurationDto> { Data = createdConfig };

            _mockMediator.Setup(m => m.Send(command, default))
                .ReturnsAsync(response);

            // Act
            var actionResult = await _controller.Create(command);
            var result = actionResult.Result as CreatedAtActionResult;

            // Assert
            Assert.NotNull(result);
            Assert.Equal(201, result.StatusCode);
            var returnedConfig = Assert.IsType<ConfigurationDto>(result.Value);
            Assert.Equal("NewConfig", returnedConfig.Name);
        }

        [Fact]
        public async Task Create_ReturnsConflict_WhenNameAlreadyExists()
        {
            // Arrange
            var command = new CreateConfiguration.Command("ExistingConfig", "{}");
            var response = new BaseResponse<ConfigurationDto>
            {
                Success = false,
                Message = "Configuration already exists"
            };

            _mockMediator.Setup(m => m.Send(command, default))
                .ReturnsAsync(response);

            // Act
            var actionResult = await _controller.Create(command);
            var result = actionResult.Result as ObjectResult;

            // Assert
            Assert.NotNull(result);
            Assert.Equal(409, result.StatusCode);
        }

        // ... other tests updated similarly
    }
}