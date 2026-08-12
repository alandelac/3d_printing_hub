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
            services.AddScoped<IFilamentProfileService, FilamentProfileService>();
            services.AddScoped<IMaterialTypeService, MaterialTypeService>();
            services.AddScoped<IMarketplaceService, MarketplaceService>();
            services.AddScoped<IModelPrintCategoryService, ModelPrintCategoryService>();
            services.AddScoped<IModelPrintService, ModelPrintService>();
            services.AddScoped<IProductStockService, ProductStockService>();
            services.AddScoped<ISettingService, SettingService>();

            services.AddFluentValidationAutoValidation();
            services.AddValidatorsFromAssemblyContaining<ModelPrintCreateDtoValidator>();

            return services;
        }
    }
}
