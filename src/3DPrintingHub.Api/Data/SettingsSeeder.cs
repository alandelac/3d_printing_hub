using _3DPrintingHub.Domain.Entities;
using _3DPrintingHub.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace _3DPrintingHub.Api.Data;

public static class SettingsSeeder
{
    /// <summary>
    /// Seeds the Settings table with default values if it's empty.
    /// Add new settings here as needed.
    /// </summary>
    public static async Task SeedAsync(ApplicationDbContext dbContext)
    {
        // Check if settings already exist
        var hasSettings = await dbContext.Settings.AnyAsync();
        
        if (hasSettings)
        {
            return; // Settings already seeded
        }

        // Default settings - add new ones here
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
             }
        };
        

        await dbContext.Settings.AddRangeAsync(defaultSettings);
        await dbContext.SaveChangesAsync();
    }
}
