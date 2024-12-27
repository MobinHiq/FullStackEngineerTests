using Rovio.Configuration.Models.Dtos;

namespace Rovio.Configuration.Repositories.Mapping;

public interface IConfigurationMapper
{
    ConfigurationDto ToDto(ConfigurationEntity entity);
    ConfigurationEntity ToEntity(ConfigurationDto dto);
    IEnumerable<ConfigurationDto> ToDtos(IEnumerable<ConfigurationEntity> entities);
}

public class ConfigurationMapper : IConfigurationMapper
{
    public ConfigurationDto ToDto(ConfigurationEntity entity)
    {
        if (entity == null) return null;

        return new ConfigurationDto
        {
            Id = entity.Id ?? string.Empty,
            Name = entity.Name,
            JsonConfig = entity.JsonConfig,
            CreatedAt = entity.CreatedAt,
            UpdatedAt = entity.UpdatedAt
        };
    }

    public ConfigurationEntity ToEntity(ConfigurationDto dto)
    {
        if (dto == null) return null;

        return new ConfigurationEntity
        {
            Id = string.IsNullOrEmpty(dto.Id) ? Guid.NewGuid().ToString() : dto.Id,
            Name = dto.Name,
            JsonConfig = dto.JsonConfig,
            CreatedAt = dto.CreatedAt,
            UpdatedAt = dto.UpdatedAt
        };
    }

    public IEnumerable<ConfigurationDto> ToDtos(IEnumerable<ConfigurationEntity> entities)
    {
        return entities?.Select(ToDto);
    }
} 