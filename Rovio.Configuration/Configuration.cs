namespace Rovio.Configuration;

public class Configuration
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string JsonConfig { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}