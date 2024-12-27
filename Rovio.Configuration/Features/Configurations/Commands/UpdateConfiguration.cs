using MediatR;
using Rovio.Configuration.Common;
using Rovio.Configuration.Models.Dtos;
using Rovio.Configuration.Services;

namespace Rovio.Configuration.Features.Configurations.Commands
{
    public class UpdateConfiguration
    {
        public record Command(ConfigurationDto Configuration) : IRequest<BaseResponse<ConfigurationDto>>;

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
                    response.Data = await _configurationService.UpdateAsync(request.Configuration);
                }
                catch (KeyNotFoundException ex)
                {
                    response.Success = false;
                    response.Message = ex.Message;
                }
                catch (Exception ex)
                {
                    response.Success = false;
                    response.Message = "An error occurred while updating the configuration";
                }

                return response;
            }
        }
    }
} 