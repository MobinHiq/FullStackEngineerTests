using MediatR;
using Microsoft.Extensions.Logging;
using Rovio.Configuration.Common;
using Rovio.Configuration.Models.Dtos;
using Rovio.Configuration.Services;

namespace Rovio.Configuration.Features.Configurations.Queries
{
    public class GetAllConfigurations
    {
        public record Query(int? Skip = null, int? Take = null, string? SearchTerm = null) 
            : IRequest<BaseResponse<IEnumerable<ConfigurationDto>>>;

        public class Handler : IRequestHandler<Query, BaseResponse<IEnumerable<ConfigurationDto>>>
        {
            private readonly IConfigurationService _configurationService;
            private readonly ILogger<Handler> _logger;

            public Handler(IConfigurationService configurationService, ILogger<Handler> logger)
            {
                _logger = logger;
                _configurationService = configurationService;
            }

            public async Task<BaseResponse<IEnumerable<ConfigurationDto>>> Handle(Query request, CancellationToken cancellationToken)
            {
                var response = new BaseResponse<IEnumerable<ConfigurationDto>>();

                try
                {
                    var configurations = await _configurationService.GetAllAsync();
                    var query = configurations.AsEnumerable();

                    // Apply filters
                    if (!string.IsNullOrEmpty(request.SearchTerm))
                    {
                        query = query.Where(c => c.Name.Contains(request.SearchTerm) || 
                                               c.JsonConfig.Contains(request.SearchTerm));
                    }

                    // Apply pagination
                    if (request.Skip.HasValue)
                    {
                        query = query.Skip(request.Skip.Value);
                    }

                    if (request.Take.HasValue)
                    {
                        query = query.Take(request.Take.Value);
                    }

                    response.Data = query.ToList();
                }
                catch (Exception ex)
                {
                    response.Success = false;
                    response.Message = "An error occurred while retrieving configurations";
                    _logger.LogError(ex, "Error retrieving configurations");
                }

                return response;
            }
        }
    }
} 