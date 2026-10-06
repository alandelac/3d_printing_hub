using _3DPrintingHub.Api.Data;
using _3DPrintingHub.Domain.Entities;
using _3DPrintingHub.Infrastructure.Data;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;

namespace _3DPrintingHub.Tests.Integration;

public class SettingsSeederIntegrationTests
{
    [Fact]
    public async Task SeedAsync_WhenDatabaseIsEmpty_InsertsAllDefaults()
    {
        await using var connection = new SqliteConnection("Filename=:memory:");
        await connection.OpenAsync();
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseSqlite(connection)
            .Options;

        await using var dbContext = new ApplicationDbContext(options);
        await dbContext.Database.EnsureCreatedAsync();

        await SettingsSeeder.SeedAsync(dbContext);
        await SettingsSeeder.SeedAsync(dbContext);

        var settings = await dbContext.Settings.AsNoTracking().ToListAsync();
        Assert.Equal(5, settings.Count);
        Assert.Contains(settings, setting => setting.parameter == "minimum_inventory_quantity" && setting.value == 2m);
    }

    [Fact]
    public async Task SeedAsync_WhenSomeSettingsExist_InsertsOnlyMissingDefaults()
    {
        await using var connection = new SqliteConnection("Filename=:memory:");
        await connection.OpenAsync();
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseSqlite(connection)
            .Options;

        await using var dbContext = new ApplicationDbContext(options);
        await dbContext.Database.EnsureCreatedAsync();
        dbContext.Settings.AddRange(
            new Settings { parameter = "electricity_cost_per_kwh", value = 9.75m },
            new Settings { parameter = "custom_operator_setting", value = 42m });
        await dbContext.SaveChangesAsync();

        await SettingsSeeder.SeedAsync(dbContext);

        var settings = await dbContext.Settings.AsNoTracking().ToListAsync();
        Assert.Equal(6, settings.Count);
        Assert.Equal(9.75m, settings.Single(setting => setting.parameter == "electricity_cost_per_kwh").value);
        Assert.Equal(42m, settings.Single(setting => setting.parameter == "custom_operator_setting").value);
        Assert.Equal(2m, settings.Single(setting => setting.parameter == "minimum_inventory_quantity").value);
    }
}