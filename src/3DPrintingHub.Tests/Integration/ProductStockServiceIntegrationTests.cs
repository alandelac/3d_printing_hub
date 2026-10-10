using _3DPrintingHub.Api.Data;
using _3DPrintingHub.Application.Dtos;
using _3DPrintingHub.Domain.Entities;
using _3DPrintingHub.Infrastructure.Data;
using _3DPrintingHub.Infrastructure.Services;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

namespace _3DPrintingHub.Tests.Integration;

public class ProductStockServiceIntegrationTests
{
    [Fact]
    public async Task MinimumInventoryMigration_BackfillsExistingRowsToTwo()
    {
        await using var connection = new SqliteConnection("Filename=:memory:");
        await connection.OpenAsync();
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseSqlite(connection)
            .Options;

        await using var dbContext = new ApplicationDbContext(options);
        var migrator = dbContext.GetService<IMigrator>();
        await migrator.MigrateAsync("20261006033825_AddPrintJobProducedQuantity");

        var (model, _, filament) = await AddReferencesAsync(dbContext);
        var stockId = Guid.NewGuid();
        await dbContext.Database.ExecuteSqlInterpolatedAsync($"""
            INSERT INTO ProductStocks (Id, ModelPrintId, FilamentId, QuantityInStock, Version, CostToProduce, RecommendedSalePrice, SalePrice, LastUpdated)
            VALUES ({stockId}, {model.Id}, {filament.Id}, {4}, {0}, {10m}, {20m}, {20m}, {DateTime.UtcNow})
            """);

        await migrator.MigrateAsync("20261006232656_AddProductStockMinimumInventoryQuantity");

        var persistedStock = await dbContext.ProductStocks.AsNoTracking().SingleAsync(stock => stock.Id == stockId);
        Assert.Equal(4, persistedStock.QuantityInStock);
        Assert.Equal(2, persistedStock.MinimumInventoryQuantity);
    }

    [Fact]
    public async Task CreateAndUpdateProductStock_UsesDefaultForNewRowsAndPersistsPerRowMinimum()
    {
        await using var connection = new SqliteConnection("Filename=:memory:");
        await connection.OpenAsync();
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseSqlite(connection)
            .Options;

        await using var dbContext = new ApplicationDbContext(options);
        await dbContext.Database.EnsureCreatedAsync();
        var (firstModel, secondModel, filament) = await AddReferencesAsync(dbContext);
        await SettingsSeeder.SeedAsync(dbContext);

        var minimumSetting = await dbContext.Settings
            .SingleAsync(setting => setting.parameter == "minimum_inventory_quantity");
        minimumSetting.value = 3m;
        await dbContext.SaveChangesAsync();

        var service = new ProductStockService(dbContext, new PrintPricingService(dbContext));
        var firstId = await service.CreateProductStockAsync(new ProductStockCreateDto
        {
            ModelPrintId = firstModel.Id,
            FilamentId = filament.Id,
            QuantityInStock = 1
        });

        minimumSetting.value = 5m;
        await dbContext.SaveChangesAsync();

        var secondId = await service.CreateProductStockAsync(new ProductStockCreateDto
        {
            ModelPrintId = secondModel.Id,
            FilamentId = filament.Id,
            QuantityInStock = 3
        });

        var updatedStock = await service.UpdateProductStockAsync(new ProductStockUpdateDto
        {
            Id = firstId,
            MinimumInventoryQuantity = 6
        });

        var stocks = await dbContext.ProductStocks.AsNoTracking().OrderBy(stock => stock.ModelPrintId).ToListAsync();
        Assert.Equal(6, updatedStock.MinimumInventoryQuantity);
        Assert.Equal(6, stocks.Single(stock => stock.Id == firstId).MinimumInventoryQuantity);
        Assert.Equal(5, stocks.Single(stock => stock.Id == secondId).MinimumInventoryQuantity);
        Assert.Equal(1, stocks.Single(stock => stock.Id == firstId).QuantityInStock);
        Assert.Equal(3, stocks.Single(stock => stock.Id == secondId).QuantityInStock);
    }

    private static async Task<(ModelPrint FirstModel, ModelPrint SecondModel, Filament Filament)> AddReferencesAsync(
        ApplicationDbContext dbContext)
    {
        var category = new ModelPrintCategory { Name = "Functional" };
        var firstModel = CreateModel("First model", category);
        var secondModel = CreateModel("Second model", category);
        var color = new FilamentColor { Name = "Black", ColorCode = "#000000" };
        var brand = new Brand { Name = "Prusa" };
        var materialType = new MaterialType { Name = "PLA" };
        var profile = new FilamentProfile
        {
            BrandId = brand.Id,
            MaterialTypeId = materialType.Id,
            BrandName = brand,
            MaterialType = materialType
        };
        var filament = new Filament
        {
            FilamentProfileId = profile.Id,
            Profile = profile,
            FilamentColorId = color.Id,
            Color = color,
            MinCost = 8m,
            MaxCost = 16m,
            LastCost = 16m,
            RemainingWeightGrams = 1000
        };

        dbContext.ModelPrintCategories.Add(category);
        dbContext.ModelPrints.AddRange(firstModel, secondModel);
        dbContext.FilamentColors.Add(color);
        dbContext.Brands.Add(brand);
        dbContext.MaterialTypes.Add(materialType);
        dbContext.FilamentProfiles.Add(profile);
        dbContext.Filaments.Add(filament);
        await dbContext.SaveChangesAsync();

        return (firstModel, secondModel, filament);
    }

    private static ModelPrint CreateModel(string name, ModelPrintCategory category) => new()
    {
        Name = name,
        CategoryId = category.Id,
        Category = category,
        EstimatedWeightGrams = 200,
        EstimatedTimeMinutes = 60,
        DefaultSalePrice = 20m,
        DefaultCost = 10m,
        CommercialLicense = false,
        FileLocationOrUrl = "model.stl",
        Notes = "Test"
    };
}