using MediatR;
using Microsoft.AspNetCore.Mvc;
using Rovio.Configuration.Features.Configurations.Commands;
using Rovio.Configuration.Features.Configurations.Queries;
using Rovio.Configuration.Models.Dtos;
using Microsoft.EntityFrameworkCore;

namespace Rovio.Configuration.Net.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ConfigurationController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ILogger<ConfigurationController> _logger;

    public ConfigurationController(IMediator mediator, ILogger<ConfigurationController> logger)
    {
        _mediator = mediator;
        _logger = logger;
    }

    [HttpGet("test")]
    public IActionResult Test()
    {
        _logger.LogInformation("Test endpoint called");
        Response.Headers.Append("X-Debug", "API-Test");
        return Ok(new { message = "API is working!" });
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] int? skip = null, [FromQuery] int? take = null, [FromQuery] string? searchTerm = null)
    {
        try
        {
            _logger.LogInformation("Getting all configurations");
            
            var query = new GetAllConfigurations.Query(skip, take, searchTerm);
            var response = await _mediator.Send(query);
            
            if (!response.Success)
                return StatusCode(500, new { error = response.Message });

            return Ok(response.Data);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting configurations");
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ConfigurationDto>> GetById(string id)
    {
        var response = await _mediator.Send(new GetConfiguration.Query(id));
        
        if (!response.Success)
            return NotFound(response.Message);

        return Ok(response.Data);
    }

    [HttpPost]
    public async Task<ActionResult<ConfigurationDto>> Create([FromBody] CreateConfiguration.Command command)
    {
        var response = await _mediator.Send(command);

        if (!response.Success)
        {
            if (response.Message.Contains("already exists"))
                return Conflict(new { message = response.Message });
            
            return BadRequest(new { message = response.Message });
        }

        return CreatedAtAction(nameof(GetById), new { id = response.Data.Id }, response.Data);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(string id, [FromBody] ConfigurationDto configurationDto)
    {
        try
        {
            if (id != configurationDto.Id)
            {
                return BadRequest(new { message = "ID mismatch" });
            }

            var result = await _mediator.Send(new UpdateConfiguration.Command(configurationDto));
            return Ok(result);
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = $"Configuration with ID {id} not found" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Internal server error", details = ex.Message });
        }
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        await _mediator.Send(new DeleteConfiguration.Command(id));
        return NoContent();
    }

    [HttpGet("dbtest")]
    public async Task<IActionResult> TestDatabase()
    {
        try
        {
            await _mediator.Send(new TestDatabase.Query());
            return Ok("Database connection successful");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Database connection test failed");
            return StatusCode(500, $"Database connection failed: {ex.Message}");
        }
    }
}