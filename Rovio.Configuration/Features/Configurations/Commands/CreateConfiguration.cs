using MediatR;
using Rovio.Configuration.Common;
using Rovio.Configuration.Models.Dtos;
using Rovio.Configuration.Services;

namespace Rovio.Configuration.Features.Configurations.Commands
{
    public class CreateConfiguration
    {
        public record Command(string Name, string JsonConfig) : IRequest<BaseResponse<ConfigurationDto>>;

        public class Handler : IRequestHandler<Command, BaseResponse<ConfigurationDto>>
        {
            private readonly IConfigurationService _configurationService;

            public Handler(IConfigurationService configurationService)
            {
                _configurationService = configurationService;
            }

            public async Task<BaseResponse<ConfigurationDto>> Handle(Command request, CancellationToken cancellationToken)
            {
                var response = new BaseResponse<ConfigurationDto>();

                try
                {
                    var config = new ConfigurationDto
                    {
                        Name = request.Name,
                        JsonConfig = request.JsonConfig
                    };

                    response.Data = await _configurationService.CreateAsync(config);
                }
                catch (InvalidOperationException ex)
                {
                    response.Success = false;
                    response.Message = ex.Message;
                }
                catch (Exception ex)
                {
                    response.Success = false;
                    response.Message = "An error occurred while creating the configuration";
                }

                return response;
            }
        }
    }
} 