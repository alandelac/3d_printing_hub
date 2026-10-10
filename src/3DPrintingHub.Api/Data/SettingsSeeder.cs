using _3DPrintingHub.Domain.Entities;
using _3DPrintingHub.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace _3DPrintingHub.Api.Data;

public static class SettingsSeeder
{
    /// <summary>
    /// Inserts missing defaults while preserving any existing setting values.
    /// </summary>
    public static async Task SeedAsync(ApplicationDbContext dbContext)
    {
        var defaultSettings = new List<Settings>
        {
            new() {
                parameter = "electricity_cost_per_kwh",
                value = 4.2m
            },
             new() {
                 parameter = "printer_electricity_consumption_per_hour",
                 value = 150m
             },
             new() {
                 parameter = "tear_down_cost_per_hour",
                 value = 2m
             },
             new() {
                 parameter = "misprint_error_rate",
                    value = 0.2m
             },
             new() {
                 parameter = "minimum_inventory_quantity",
                 value = 2m
             }
        };

        var existingParameters = await dbContext.Settings
            .Select(setting => setting.parameter)
            .ToListAsync();
        var existingParameterSet = new HashSet<string>(existingParameters, StringComparer.OrdinalIgnoreCase);
        var missingSettings = defaultSettings
            .Where(setting => !existingParameterSet.Contains(setting.parameter))
            .ToList();

        if (missingSettings.Count == 0)
        {
            return;
        }

        await dbContext.Settings.AddRangeAsync(missingSettings);
        await dbContext.SaveChangesAsync();
    }
}
