using MediatR;
using Rovio.Configuration.Common;
using Rovio.Configuration.Models.Dtos;
using Rovio.Configuration.Services;

namespace Rovio.Configuration.Features.Configurations.Queries
{
    public class GetConfiguration
    {
        public record Query(string Id) : IRequest<BaseResponse<ConfigurationDto>>;

        public class Handler : IRequestHandler<Query, BaseResponse<ConfigurationDto>>
        {
            private readonly IConfigurationService _configurationService;

            public Handler(IConfigurationService configurationService)
            {
                _configurationService = configurationService;
            }

            public async Task<BaseResponse<ConfigurationDto>> Handle(Query request, CancellationToken cancellationToken)
            {
                var response = new BaseResponse<ConfigurationDto>();

                try
                {
                    response.Data = await _configurationService.GetByIdAsync(request.Id);
                    if (response.Data == null)
                    {
                        response.Success = false;
                        response.Message = $"Configuration with ID {request.Id} not found";
                    }
                }
                catch (Exception ex)
                {
                    response.Success = false;
                    response.Message = "An error occurred while retrieving the configuration";
                }

                return response;
            }
        }
    }
} 