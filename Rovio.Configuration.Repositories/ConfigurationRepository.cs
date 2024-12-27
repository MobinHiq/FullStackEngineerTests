using Microsoft.EntityFrameworkCore;
using Rovio.Configuration.Models.Dtos;
using Rovio.Configuration.Repositories.Mapping;

namespace Rovio.Configuration.Repositories;

public class ConfigurationRepository : IConfigurationRepository
{
    private readonly ConfigurationDbContext _dbContext;
    private readonly IConfigurationMapper _mapper;
    public ConfigurationRepository(ConfigurationDbContext dbContext, IConfigurationMapper mapper)
    {
        _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
        _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
    }
    public async Task<ConfigurationDto> GetByIdAsync(string id)
    {
        var entity = await _dbContext.Configurations
            .FirstOrDefaultAsync(c => c.Id == id);
        return _mapper.ToDto(entity);
    }
    public async Task<ConfigurationDto> GetByKeyAsync(string key)
    {
        var entity = await _dbContext.Configurations
            .FirstOrDefaultAsync(c => c.Name == key);
        return _mapper.ToDto(entity);
    }
    public async Task<IEnumerable<ConfigurationDto>> GetAllAsync()
    {
        var query = _dbContext.Configurations.AsNoTracking();
        var entities = await query.ToListAsync();
        return _mapper.ToDtos(entities);
    }
    public async Task<ConfigurationDto> CreateAsync(ConfigurationDto configurationDto)
    {
        try
        {
            // Check for duplicate names before attempting to create
            if (await _dbContext.Configurations.AnyAsync(c => c.Name == configurationDto.Name))
            {
                throw new InvalidOperationException($"Configuration with name '{configurationDto.Name}' already exists");
            }

            var entity = _mapper.ToEntity(configurationDto);
            
            // Generate new ID and set timestamps
            entity.Id = Guid.NewGuid().ToString();
            entity.CreatedAt = DateTime.UtcNow;
            entity.UpdatedAt = DateTime.UtcNow;

            _dbContext.Configurations.Add(entity);
            await _dbContext.SaveChangesAsync();

            return _mapper.ToDto(entity);
        }
        catch (DbUpdateException ex)
        {
            throw new InvalidOperationException("Failed to create configuration", ex);
        }
    }
    public async Task<ConfigurationDto> UpdateAsync(ConfigurationDto configurationDto)
    {
        var entity = await _dbContext.Configurations
            .FirstOrDefaultAsync(c => c.Id == configurationDto.Id);
        if (entity == null)
        {
            throw new KeyNotFoundException($"Configuration with ID {configurationDto.Id} not found.");
        }

        // Update the entity properties
        entity.Name = configurationDto.Name;
        entity.JsonConfig = configurationDto.JsonConfig;
        
        // Explicitly set the UpdatedAt timestamp to current UTC time
        var now = DateTime.UtcNow;
        entity.UpdatedAt = now;

        await _dbContext.SaveChangesAsync();
        
        // Verify the timestamp was updated
        await _dbContext.Entry(entity).ReloadAsync();
        
        return _mapper.ToDto(entity);
    }
    public async Task DeleteAsync(string id)
    {
        var entity = await _dbContext.Configurations
            .FirstOrDefaultAsync(c => c.Id == id);
        if (entity == null)
        {
            throw new KeyNotFoundException($"Configuration with ID {id} not found.");
        }
        _dbContext.Configurations.Remove(entity);
        await _dbContext.SaveChangesAsync();
    }
    public async Task<bool> ExistsAsync(string key)
    {
        return await _dbContext.Configurations
            .AnyAsync(c => c.Name == key);
    }
    public async Task<IEnumerable<ConfigurationDto>> GetAll(int? skip = null, int? take = null, string? searchTerm = null)
    {
        var query = _dbContext.Configurations.AsNoTracking();

        if (!string.IsNullOrEmpty(searchTerm))
        {
            query = query.Where(c => c.Name.Contains(searchTerm) || 
                                    c.JsonConfig.Contains(searchTerm));
        }

        if (skip.HasValue)
        {
            query = query.Skip(skip.Value);
        }

        if (take.HasValue)
        {
            query = query.Take(take.Value);
        }

        var entities = await query.ToListAsync();
        return _mapper.ToDtos(entities);
    }
}