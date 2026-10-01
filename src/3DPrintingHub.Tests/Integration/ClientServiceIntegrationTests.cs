using _3DPrintingHub.Application.Dtos;
using _3DPrintingHub.Domain.Entities;
using _3DPrintingHub.Infrastructure.Data;
using _3DPrintingHub.Infrastructure.Services;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;

namespace _3DPrintingHub.Tests.Integration;

public class ClientServiceIntegrationTests
{
    [Fact]
    public async Task CreateClientAsync_PersistsClientUsingTemporarySqliteDatabase()
    {
        await using var connection = new SqliteConnection("Filename=:memory:");
        await connection.OpenAsync();

        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseSqlite(connection)
            .Options;

        await using (var dbContext = new ApplicationDbContext(options))
        {
            await dbContext.Database.EnsureCreatedAsync();

            var service = new ClientService(dbContext);

            var createdId = await service.CreateClientAsync(new ClientCreateDto
            {
                Name = "Sample Client",
                ContactPlatform = ClientContactPlatform.WhatsApp,
                Phone = "+351912345678",
                Email = "sample@example.com"
            });

            var savedClient = await dbContext.Clients.AsNoTracking().SingleAsync();

            Assert.Equal("Sample Client", savedClient.Name);
            Assert.Equal(ClientContactPlatform.WhatsApp, savedClient.ContactPlatform);
            Assert.Equal(createdId, savedClient.Id);
        }
    }
}
