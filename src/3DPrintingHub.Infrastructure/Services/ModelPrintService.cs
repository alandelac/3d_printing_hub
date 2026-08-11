using Microsoft.EntityFrameworkCore;
using _3DPrintingHub.Application.Dtos;
using _3DPrintingHub.Application.Services;
using _3DPrintingHub.Domain.Entities;
using _3DPrintingHub.Infrastructure.Data;

namespace _3DPrintingHub.Infrastructure.Services;

public class ModelPrintService(
    ApplicationDbContext dbContext,
    ISettingService settingService) : IModelPrintService
{
    public async Task<ModelPrintDto> CreateModelPrintAsync(ModelPrintCreateDto dto, CancellationToken cancellationToken = default)
    {
        // Validate category exists
        var category = await dbContext.ModelPrintCategories
            .FirstOrDefaultAsync(c => c.Id == dto.CategoryId, cancellationToken)
            ?? throw new InvalidOperationException($"Model print category with ID {dto.CategoryId} does not exist.");

        // Get settings needed for cost calculation
        var misprintRatioSetting = await settingService.GetSettingByParameterAsync("misprint_error_rate", cancellationToken)
            ?? throw new InvalidOperationException("Setting 'misprint_error_rate' is not configured.");
        var electricityPriceSetting = await settingService.GetSettingByParameterAsync("electricity_cost_per_kwh", cancellationToken)
            ?? throw new InvalidOperationException("Setting 'electricity_cost_per_kwh' is not configured.");
        var printerConsumptionSetting = await settingService.GetSettingByParameterAsync("printer_electricity_consumption_per_hour", cancellationToken)
            ?? throw new InvalidOperationException("Setting 'printer_electricity_consumption_per_hour' is not configured.");
        var teardownPriceSetting = await settingService.GetSettingByParameterAsync("tear_down_cost_per_hour", cancellationToken)
            ?? throw new InvalidOperationException("Setting 'tear_down_cost_per_hour' is not configured.");

        var misprintRatio = misprintRatioSetting.Value;
        var electricityPrice = electricityPriceSetting.Value;
        var printerConsumptionWatts = printerConsumptionSetting.Value;
        var teardownPricePerHour = teardownPriceSetting.Value;

        // Calculate average maxPrice of all filaments
        var avgMaxPrice = await dbContext.Filaments
            .AverageAsync(f => (decimal)f.MaxCost, cancellationToken);

        // Material cost: grams * (avgMaxPrice / 1000) * misprintRatio
        // MaxCost is per kg (1000g), so cost per gram = maxPrice / 1000
        var materialCost = dto.EstimatedWeightGrams * (avgMaxPrice / 1000m) * (1 + misprintRatio);

        // Electricity cost: (timeMinutes / 60) * (watts / 1000) * electricityPricePerKwh
        var electricityCost = (dto.EstimatedTimeMinutes / 60m) * (printerConsumptionWatts / 1000m) * electricityPrice;

        // Teardown cost: (timeMinutes / 60) * teardownPricePerHour
        var teardownCost = (dto.EstimatedTimeMinutes / 60m) * teardownPricePerHour;

        var defaultCost = materialCost + electricityCost + teardownCost;
        var defaultSalePrice = defaultCost * 2;

        var modelPrint = new ModelPrint
        {
            Name = dto.Name,
            CategoryId = dto.CategoryId,
            EstimatedWeightGrams = dto.EstimatedWeightGrams,
            EstimatedTimeMinutes = dto.EstimatedTimeMinutes,
            FileLocationOrUrl = dto.FileLocationOrUrl,
            Notes = dto.Notes,
            CommercialLicense = true,
            DefaultCost = defaultCost,
            DefaultSalePrice = defaultSalePrice
        };

        await dbContext.ModelPrints.AddAsync(modelPrint, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);

        return new ModelPrintDto
        {
            Id = modelPrint.Id,
            Name = modelPrint.Name,
            CategoryId = modelPrint.CategoryId,
            CategoryName = category.Name,
            EstimatedWeightGrams = modelPrint.EstimatedWeightGrams,
            EstimatedTimeMinutes = modelPrint.EstimatedTimeMinutes,
            CommercialLicense = modelPrint.CommercialLicense,
            DefaultCost = modelPrint.DefaultCost,
            DefaultSalePrice = modelPrint.DefaultSalePrice,
            FileLocationOrUrl = modelPrint.FileLocationOrUrl,
            Notes = modelPrint.Notes
        };
    }
    public async Task<IEnumerable<ModelPrintDto>> GetAllModelPrintsAsync(CancellationToken cancellationToken = default)
    {
        var modelPrints = await dbContext.ModelPrints
            .Include(m => m.Category)
            .OrderBy(m => m.Name)
            .ToListAsync(cancellationToken);

        return modelPrints.Select(m => new ModelPrintDto
        {
            Id = m.Id,
            Name = m.Name,
            CategoryId = m.CategoryId,
            CategoryName = m.Category != null ? m.Category.Name : string.Empty,
            EstimatedWeightGrams = m.EstimatedWeightGrams,
            EstimatedTimeMinutes = m.EstimatedTimeMinutes,
            CommercialLicense = m.CommercialLicense,
            DefaultCost = m.DefaultCost,
            DefaultSalePrice = m.DefaultSalePrice,
            FileLocationOrUrl = m.FileLocationOrUrl,
            Notes = m.Notes
        }).ToList();
    }
}
