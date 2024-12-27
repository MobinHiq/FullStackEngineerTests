using MediatR;
using Rovio.Configuration.Common;
using Rovio.Configuration.Services;

namespace Rovio.Configuration.Features.Configurations.Commands
{
    public class DeleteConfiguration
    {
        public record Command(string Id) : IRequest<BaseResponse>;

        public class Handler : IRequestHandler<Command, BaseResponse>
        {
            private readonly IConfigurationService _configurationService;

            public Handler(IConfigurationService configurationService)
            {
                _configurationService = configurationService;
            }

            public async Task<BaseResponse> Handle(Command request, CancellationToken cancellationToken)
            {
                var response = new BaseResponse();

                try
                {
                    await _configurationService.DeleteAsync(request.Id);
                }
                catch (KeyNotFoundException ex)
                {
                    response.Success = false;
                    response.Message = ex.Message;
                }
                catch (Exception ex)
                {
                    response.Success = false;
                    response.Message = "An error occurred while deleting the configuration";
                }

                return response;
            }
        }
    }
} 