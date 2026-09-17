using _3DPrintingHub.Application.Dtos;
using _3DPrintingHub.Infrastructure.Data;
using _3DPrintingHub.Infrastructure.Services;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;

namespace _3DPrintingHub.Tests.Integration;

public class BrandServiceIntegrationTests
{
    [Fact]
    public async Task CreateBrandAsync_PersistsBrandUsingTemporarySqliteDatabase()
    {
        await using var connection = new SqliteConnection("Filename=:memory:");
        await connection.OpenAsync();

        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseSqlite(connection)
            .Options;

        await using (var dbContext = new ApplicationDbContext(options))
        {
            await dbContext.Database.EnsureCreatedAsync();

            var brandService = new BrandService(dbContext);

            var createdId = await brandService.CreateBrandAsync(new BrandCreateDto { Name = "Prusa" });

            var savedBrand = await dbContext.Brands.AsNoTracking().SingleAsync();

            Assert.Equal("Prusa", savedBrand.Name);
            Assert.Equal(createdId, savedBrand.Id);
        }
    }
}
