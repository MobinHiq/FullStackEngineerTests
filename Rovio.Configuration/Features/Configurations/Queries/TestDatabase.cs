using MediatR;
using Rovio.Configuration.Common;
using Rovio.Configuration.Services;

namespace Rovio.Configuration.Features.Configurations.Queries
{
    public class TestDatabase
    {
        public record Query : IRequest<BaseResponse>;

        public class Handler : IRequestHandler<Query, BaseResponse>
        {
            private readonly IConfigurationService _configurationService;

            public Handler(IConfigurationService configurationService)
            {
                _configurationService = configurationService;
            }

            public async Task<BaseResponse> Handle(Query request, CancellationToken cancellationToken)
            {
                var response = new BaseResponse();

                try
                {
                    await _configurationService.GetAllAsync();
                }
                catch (Exception ex)
                {
                    response.Success = false;
                    response.Message = "Database connection test failed";
                }

                return response;
            }
        }
    }
} 