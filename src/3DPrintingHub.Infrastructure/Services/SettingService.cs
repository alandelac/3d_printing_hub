using _3DPrintingHub.Application.Dtos;
using _3DPrintingHub.Application.Services;
using _3DPrintingHub.Domain.Entities;
using _3DPrintingHub.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace _3DPrintingHub.Infrastructure.Services;

public class SettingService(
    ApplicationDbContext dbContext,
    IPrintPricingService printPricingService) : ISettingService
{
    // Settings that participate in the ModelPrint cost calculation.
    private static readonly HashSet<string> PricingSettingParameters =
        new(StringComparer.OrdinalIgnoreCase)
        {
            "misprint_error_rate",
            "electricity_cost_per_kwh",
            "printer_electricity_consumption_per_hour",
            "tear_down_cost_per_hour",
        };

    public async Task<Guid> CreateSettingAsync(SettingCreateDto dto, CancellationToken cancellationToken = default)
    {
        // Check if a setting with the same parameter name already exists
        var existingSetting = await dbContext.Settings
            .FirstOrDefaultAsync(s => s.parameter == dto.Parameter, cancellationToken);

        if (existingSetting != null)
        {
            throw new InvalidOperationException($"A setting with parameter '{dto.Parameter}' already exists.");
        }

        var setting = new Settings
        {
            parameter = dto.Parameter,
            value = dto.Value
        };

        await dbContext.Settings.AddAsync(setting, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);

        // A newly created pricing setting changes the cost calculation,
        // so keep ModelPrint costs and prices in sync.
        if (PricingSettingParameters.Contains(setting.parameter))
        {
            await printPricingService.RecalculateAllModelPrintCostsAsync(cancellationToken);
        }

        return setting.Id;
    }

    public async Task<IEnumerable<SettingDto>> GetAllSettingsAsync(CancellationToken cancellationToken = default)
    {
        var settings = await dbContext.Settings
            .Select(s => new SettingDto
            {
                Id = s.Id,
                Parameter = s.parameter,
                Value = s.value
            })
            .OrderBy(s => s.Parameter)
            .ToListAsync(cancellationToken);

        return settings;
    }

    public async Task<SettingDto?> GetSettingByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var setting = await dbContext.Settings
            .Where(s => s.Id == id)
            .Select(s => new SettingDto
            {
                Id = s.Id,
                Parameter = s.parameter,
                Value = s.value
            })
            .FirstOrDefaultAsync(cancellationToken);

        return setting;
    }

    public async Task<SettingDto?> GetSettingByParameterAsync(string parameter, CancellationToken cancellationToken = default)
    {
        var setting = await dbContext.Settings
            .Where(s => s.parameter == parameter)
            .Select(s => new SettingDto
            {
                Id = s.Id,
                Parameter = s.parameter,
                Value = s.value
            })
            .FirstOrDefaultAsync(cancellationToken);

        return setting;
    }

    public async Task<SettingDto> UpdateSettingAsync(Guid id, SettingCreateDto dto, CancellationToken cancellationToken = default)
    {
        var setting = await dbContext.Settings
            .FirstOrDefaultAsync(s => s.Id == id, cancellationToken)
            ?? throw new InvalidOperationException($"Setting with ID {id} not found.");

        // Check if another setting already has this parameter name
        var duplicateSetting = await dbContext.Settings
            .FirstOrDefaultAsync(s => s.parameter == dto.Parameter && s.Id != id, cancellationToken);

        if (duplicateSetting != null)
        {
            throw new InvalidOperationException($"A setting with parameter '{dto.Parameter}' already exists.");
        }

        setting.parameter = dto.Parameter;
        setting.value = dto.Value;

        await dbContext.SaveChangesAsync(cancellationToken);

        // If a pricing setting changed, the cost calculation changed too,
        // so keep ModelPrint costs and prices in sync.
        if (PricingSettingParameters.Contains(setting.parameter))
        {
            await printPricingService.RecalculateAllModelPrintCostsAsync(cancellationToken);
        }

        return new SettingDto
        {
            Id = setting.Id,
            Parameter = setting.parameter,
            Value = setting.value
        };
    }

    public async Task<bool> DeleteSettingAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var setting = await dbContext.Settings
            .FirstOrDefaultAsync(s => s.Id == id, cancellationToken);

        if (setting == null)
        {
            return false;
        }

        dbContext.Settings.Remove(setting);
        await dbContext.SaveChangesAsync(cancellationToken);

        return true;
    }
}
