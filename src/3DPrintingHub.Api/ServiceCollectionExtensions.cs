using _3DPrintingHub.Application.Services;
using _3DPrintingHub.Application.Validators;
using _3DPrintingHub.Infrastructure.Services;
using FluentValidation;
using FluentValidation.AspNetCore;

namespace Microsoft.Extensions.DependencyInjection
{
    public static class ServiceCollectionExtensions
    {
        public static IServiceCollection AddApplicationServices(this IServiceCollection services)
        {
            services.AddScoped<IFilamentService, FilamentService>();
            services.AddScoped<IFilamentColorService, FilamentColorService>();
            services.AddScoped<IBrandService, BrandService>();
            services.AddScoped<IMaterialTypeService, MaterialTypeService>();
            services.AddScoped<IMarketplaceService, MarketplaceService>();

            services.AddFluentValidationAutoValidation();
            services.AddValidatorsFromAssemblyContaining<BrandCreateDtoValidator>();

            return services;
        }
    }
}
