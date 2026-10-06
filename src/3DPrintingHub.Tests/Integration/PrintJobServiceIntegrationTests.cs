using _3DPrintingHub.Application.Dtos;
using _3DPrintingHub.Application.Exceptions;
using _3DPrintingHub.Domain.Entities;
using _3DPrintingHub.Infrastructure.Data;
using _3DPrintingHub.Infrastructure.Services;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;

namespace _3DPrintingHub.Tests.Integration;

public class PrintJobServiceIntegrationTests
{
    [Fact]
    public async Task CreatePrintJobAsync_WhenValid_UpdatesInventoryAndPersistsJob()
    {
        await using var connection = new SqliteConnection("Filename=:memory:");
        await connection.OpenAsync();

        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseSqlite(connection)
            .Options;

        await using (var dbContext = new ApplicationDbContext(options))
        {
            await dbContext.Database.EnsureCreatedAsync();

            var category = new ModelPrintCategory { Name = "Functional parts" };
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

            var modelPrint = new ModelPrint
            {
                Name = "Test model",
                Category = category,
                CategoryId = category.Id,
                EstimatedWeightGrams = 200,
                EstimatedTimeMinutes = 60,
                DefaultSalePrice = 20m,
                DefaultCost = 10m,
                CommercialLicense = false,
                FileLocationOrUrl = "file:///tmp/model.stl",
                Notes = "Test"
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
                RemainingWeightGrams = 1000,
            };

            var productStock = new ProductStock
            {
                ModelPrint = modelPrint,
                Filament = filament,
                QuantityInStock = 10,
                CostToProduce = 2m,
                RecommendedSalePrice = 25m,
                SalePrice = 25m,
                Version = 1,
            };

            await dbContext.ModelPrintCategories.AddAsync(category);
            await dbContext.FilamentColors.AddAsync(color);
            await dbContext.Brands.AddAsync(brand);
            await dbContext.MaterialTypes.AddAsync(materialType);
            await dbContext.FilamentProfiles.AddAsync(profile);
            await dbContext.ModelPrints.AddAsync(modelPrint);
            await dbContext.Filaments.AddAsync(filament);
            await dbContext.ProductStocks.AddAsync(productStock);
            await dbContext.SaveChangesAsync();

            var service = new PrintJobService(dbContext, new PrintPricingService(dbContext));

            var createdId = await service.CreatePrintJobAsync(new PrintJobCreateDto
            {
                ModelPrintId = modelPrint.Id,
                FilamentId = filament.Id,
                UsedWeightGrams = 250m,
                ProducedQuantity = 5,
                PrintedAt = new DateTime(2026, 10, 5, 12, 30, 0, DateTimeKind.Utc),
                Notes = "Completed job"
            });

            var persistedJob = await dbContext.PrintJobs.AsNoTracking().SingleAsync(j => j.Id == createdId);
            var persistedStock = await dbContext.ProductStocks.AsNoTracking().SingleAsync(ps => ps.Id == productStock.Id);
            var persistedFilament = await dbContext.Filaments.AsNoTracking().SingleAsync(f => f.Id == filament.Id);

            Assert.Equal(5, persistedJob.ProducedQuantity);
            Assert.Equal(250m, persistedJob.UsedWeightGrams);
            Assert.Equal(15, persistedStock.QuantityInStock);
            Assert.Equal(750, persistedFilament.RemainingWeightGrams);
            Assert.Equal(4m, persistedJob.CalculatedMaterialCost);
            Assert.Equal("Completed job", persistedJob.Notes);
        }
    }

    [Fact]
    public async Task CreatePrintJobAsync_WhenStockDoesNotExist_CreatesStockWithRecommendedPrice()
    {
        await using var connection = new SqliteConnection("Filename=:memory:");
        await connection.OpenAsync();

        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseSqlite(connection)
            .Options;

        await using (var dbContext = new ApplicationDbContext(options))
        {
            await dbContext.Database.EnsureCreatedAsync();

            var category = new ModelPrintCategory { Name = "Functional parts" };
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
            var modelPrint = new ModelPrint
            {
                Name = "Test model",
                Category = category,
                CategoryId = category.Id,
                EstimatedWeightGrams = 200,
                EstimatedTimeMinutes = 60,
                DefaultSalePrice = 20m,
                DefaultCost = 10m,
                CommercialLicense = false,
                FileLocationOrUrl = "file:///tmp/model.stl",
                Notes = "Test"
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
                RemainingWeightGrams = 1000,
            };

            await dbContext.ModelPrintCategories.AddAsync(category);
            await dbContext.FilamentColors.AddAsync(color);
            await dbContext.Brands.AddAsync(brand);
            await dbContext.MaterialTypes.AddAsync(materialType);
            await dbContext.FilamentProfiles.AddAsync(profile);
            await dbContext.ModelPrints.AddAsync(modelPrint);
            await dbContext.Filaments.AddAsync(filament);
            await dbContext.Settings.AddRangeAsync(
                new Settings { parameter = "misprint_error_rate", value = 0m },
                new Settings { parameter = "electricity_cost_per_kwh", value = 0m },
                new Settings { parameter = "printer_electricity_consumption_per_hour", value = 0m },
                new Settings { parameter = "tear_down_cost_per_hour", value = 0m });
            await dbContext.SaveChangesAsync();

            var service = new PrintJobService(dbContext, new PrintPricingService(dbContext));
            var createdId = await service.CreatePrintJobAsync(new PrintJobCreateDto
            {
                ModelPrintId = modelPrint.Id,
                FilamentId = filament.Id,
                UsedWeightGrams = 250m,
                ProducedQuantity = 5
            });

            var createdStock = await dbContext.ProductStocks.AsNoTracking().SingleAsync();
            var persistedJob = await dbContext.PrintJobs.AsNoTracking().SingleAsync(job => job.Id == createdId);
            var persistedFilament = await dbContext.Filaments.AsNoTracking().SingleAsync();

            Assert.Equal(modelPrint.Id, createdStock.ModelPrintId);
            Assert.Equal(filament.Id, createdStock.FilamentId);
            Assert.Equal(5, createdStock.QuantityInStock);
            Assert.Equal(3.2m, createdStock.CostToProduce);
            Assert.Equal(6.4m, createdStock.RecommendedSalePrice);
            Assert.Equal(createdStock.RecommendedSalePrice, createdStock.SalePrice);
            Assert.Equal(250m, persistedJob.UsedWeightGrams);
            Assert.Equal(750, persistedFilament.RemainingWeightGrams);
        }
    }

    [Fact]
    public async Task CreatePrintJobAsync_WhenFilamentWeightIsInsufficient_RejectsWithoutChanges()
    {
        await using var connection = new SqliteConnection("Filename=:memory:");
        await connection.OpenAsync();

        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseSqlite(connection)
            .Options;

        await using (var dbContext = new ApplicationDbContext(options))
        {
            await dbContext.Database.EnsureCreatedAsync();

            var category = new ModelPrintCategory { Name = "Desktop parts" };
            var color = new FilamentColor { Name = "White", ColorCode = "#FFFFFF" };
            var brand = new Brand { Name = "Bambu" };
            var materialType = new MaterialType { Name = "PETG" };
            var profile = new FilamentProfile
            {
                BrandId = brand.Id,
                MaterialTypeId = materialType.Id,
                BrandName = brand,
                MaterialType = materialType
            };

            var modelPrint = new ModelPrint
            {
                Name = "Test model",
                Category = category,
                CategoryId = category.Id,
                EstimatedWeightGrams = 200,
                EstimatedTimeMinutes = 60,
                DefaultSalePrice = 20m,
                DefaultCost = 10m,
                CommercialLicense = false,
                FileLocationOrUrl = "file:///tmp/model.stl",
                Notes = "Test"
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
                RemainingWeightGrams = 100,
            };

            var productStock = new ProductStock
            {
                ModelPrint = modelPrint,
                Filament = filament,
                QuantityInStock = 3,
                CostToProduce = 2m,
                RecommendedSalePrice = 25m,
                SalePrice = 25m,
                Version = 1,
            };

            await dbContext.ModelPrintCategories.AddAsync(category);
            await dbContext.FilamentColors.AddAsync(color);
            await dbContext.Brands.AddAsync(brand);
            await dbContext.MaterialTypes.AddAsync(materialType);
            await dbContext.FilamentProfiles.AddAsync(profile);
            await dbContext.ModelPrints.AddAsync(modelPrint);
            await dbContext.Filaments.AddAsync(filament);
            await dbContext.ProductStocks.AddAsync(productStock);
            await dbContext.SaveChangesAsync();

            var service = new PrintJobService(dbContext, new PrintPricingService(dbContext));

            var exception = await Assert.ThrowsAsync<BusinessRuleException>(() => service.CreatePrintJobAsync(new PrintJobCreateDto
            {
                ModelPrintId = modelPrint.Id,
                FilamentId = filament.Id,
                UsedWeightGrams = 150m,
                ProducedQuantity = 2,
                PrintedAt = DateTime.UtcNow,
                Notes = "Will fail"
            }));

            Assert.Contains("insufficient filament", exception.Message, StringComparison.OrdinalIgnoreCase);
            Assert.Equal(3, (await dbContext.ProductStocks.AsNoTracking().SingleAsync(ps => ps.Id == productStock.Id)).QuantityInStock);
            Assert.Equal(100, (await dbContext.Filaments.AsNoTracking().SingleAsync(f => f.Id == filament.Id)).RemainingWeightGrams);
            Assert.Empty(await dbContext.PrintJobs.AsNoTracking().ToListAsync());
        }
    }
}
