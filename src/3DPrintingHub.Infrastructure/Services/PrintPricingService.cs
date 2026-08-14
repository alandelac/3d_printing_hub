using _3DPrintingHub.Application.Dtos;
using _3DPrintingHub.Application.Services;
using _3DPrintingHub.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace _3DPrintingHub.Infrastructure.Services;

public class PrintPricingService(ApplicationDbContext dbContext) : IPrintPricingService
{
    public async Task<PricingInputs> GetPricingInputsAsync(CancellationToken cancellationToken = default)
    {
        // Calculate average maxPrice of all filaments (0 when there are no filaments)
        var avgMaxPrice = await dbContext.Filaments.AnyAsync(cancellationToken)
            ? await dbContext.Filaments.AverageAsync(f => (decimal)f.MaxCost, cancellationToken)
            : 0m;

        var misprintRatioSetting = await dbContext.Settings
            .FirstOrDefaultAsync(s => s.parameter == "misprint_error_rate", cancellationToken)
            ?? throw new InvalidOperationException("Setting 'misprint_error_rate' is not configured.");
        var electricityPriceSetting = await dbContext.Settings
            .FirstOrDefaultAsync(s => s.parameter == "electricity_cost_per_kwh", cancellationToken)
            ?? throw new InvalidOperationException("Setting 'electricity_cost_per_kwh' is not configured.");
        var printerConsumptionSetting = await dbContext.Settings
            .FirstOrDefaultAsync(s => s.parameter == "printer_electricity_consumption_per_hour", cancellationToken)
            ?? throw new InvalidOperationException("Setting 'printer_electricity_consumption_per_hour' is not configured.");
        var teardownPriceSetting = await dbContext.Settings
            .FirstOrDefaultAsync(s => s.parameter == "tear_down_cost_per_hour", cancellationToken)
            ?? throw new InvalidOperationException("Setting 'tear_down_cost_per_hour' is not configured.");

        return new PricingInputs(
            avgMaxPrice,
            misprintRatioSetting.value,
            electricityPriceSetting.value,
            printerConsumptionSetting.value,
            teardownPriceSetting.value);
    }

    public (decimal Cost, decimal SalePrice) CalculateCostAndSalePrice(int grams, int minutes, PricingInputs inputs)
    {
        // Material cost: grams * (avgMaxPrice / 1000) * (1 + misprintRatio)
        // MaxCost is per kg (1000g), so cost per gram = maxPrice / 1000
        var materialCost = grams * (inputs.AvgMaxPrice / 1000m) * (1 + inputs.MisprintRatio);

        // Electricity cost: (timeMinutes / 60) * (watts / 1000) * electricityPricePerKwh
        var electricityCost = (minutes / 60m) * (inputs.PrinterConsumptionWatts / 1000m) * inputs.ElectricityPricePerKwh;

        // Teardown cost: (timeMinutes / 60) * teardownPricePerHour
        var teardownCost = (minutes / 60m) * inputs.TeardownPricePerHour;

        var cost = materialCost + electricityCost + teardownCost;
        return (cost, cost * 2);
    }

    public async Task<int> RecalculateAllModelPrintCostsAsync(CancellationToken cancellationToken = default)
    {
        var inputs = await GetPricingInputsAsync(cancellationToken);

        var modelPrints = await dbContext.ModelPrints.ToListAsync(cancellationToken);
        var updatedCount = 0;

        foreach (var modelPrint in modelPrints)
        {
            var (cost, salePrice) = CalculateCostAndSalePrice(
                modelPrint.EstimatedWeightGrams,
                modelPrint.EstimatedTimeMinutes,
                inputs);

            if (modelPrint.DefaultCost != cost || modelPrint.DefaultSalePrice != salePrice)
            {
                modelPrint.DefaultCost = cost;
                modelPrint.DefaultSalePrice = salePrice;
                updatedCount++;
            }
        }

        if (updatedCount > 0)
        {
            await dbContext.SaveChangesAsync(cancellationToken);
        }

        return updatedCount;
    }
}