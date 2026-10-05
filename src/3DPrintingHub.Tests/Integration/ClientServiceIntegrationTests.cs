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
            Assert.False(savedClient.IsArchived);
        }
    }

    [Fact]
    public async Task ArchiveClientAsync_MarksClientArchivedAndPreservesData()
    {
        await using var connection = new SqliteConnection("Filename=:memory:");
        await connection.OpenAsync();

        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseSqlite(connection)
            .Options;

        await using (var dbContext = new ApplicationDbContext(options))
        {
            await dbContext.Database.EnsureCreatedAsync();

            var client = new Client
            {
                Name = "Archive Me",
                ContactPlatform = ClientContactPlatform.Facebook,
                Phone = "+351111222333",
                Email = "archive@example.com"
            };

            await dbContext.Clients.AddAsync(client);
            await dbContext.SaveChangesAsync();

            var service = new ClientService(dbContext);

            await service.ArchiveClientAsync(client.Id);

            var persisted = await dbContext.Clients.AsNoTracking().SingleAsync(c => c.Id == client.Id);
            Assert.True(persisted.IsArchived);
            Assert.Equal(client.Id, persisted.Id);
            Assert.Equal("Archive Me", persisted.Name);
            Assert.Equal(ClientContactPlatform.Facebook, persisted.ContactPlatform);
            Assert.Equal("+351111222333", persisted.Phone);
            Assert.Equal("archive@example.com", persisted.Email);

            var dto = await service.GetClientByIdAsync(client.Id);
            Assert.True(dto.IsArchived);
            Assert.Equal(client.Name, dto.Name);
        }
    }

    [Fact]
    public async Task ArchiveClientAsync_AlreadyArchivedClient_SucceedsWithoutChangingData()
    {
        await using var connection = new SqliteConnection("Filename=:memory:");
        await connection.OpenAsync();

        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseSqlite(connection)
            .Options;

        await using (var dbContext = new ApplicationDbContext(options))
        {
            await dbContext.Database.EnsureCreatedAsync();

            var client = new Client
            {
                Name = "Archived",
                IsArchived = true,
                ContactPlatform = ClientContactPlatform.PhoneCall,
                Phone = "123",
                Email = "archived@example.com"
            };

            await dbContext.Clients.AddAsync(client);
            await dbContext.SaveChangesAsync();

            var service = new ClientService(dbContext);
            await service.ArchiveClientAsync(client.Id);

            var persisted = await dbContext.Clients.AsNoTracking().SingleAsync(c => c.Id == client.Id);
            Assert.True(persisted.IsArchived);
            Assert.Equal(client.Id, persisted.Id);
            Assert.Equal("Archived", persisted.Name);
            Assert.Equal("archived@example.com", persisted.Email);
        }
    }

    [Fact]
    public async Task GetAllClientsAsync_OnlyReturnsActiveClients()
    {
        await using var connection = new SqliteConnection("Filename=:memory:");
        await connection.OpenAsync();

        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseSqlite(connection)
            .Options;

        await using (var dbContext = new ApplicationDbContext(options))
        {
            await dbContext.Database.EnsureCreatedAsync();
            await dbContext.Clients.AddRangeAsync(
                new Client { Name = "Active", ContactPlatform = ClientContactPlatform.WhatsApp },
                new Client { Name = "Archived", ContactPlatform = ClientContactPlatform.Facebook, IsArchived = true }
            );
            await dbContext.SaveChangesAsync();

            var service = new ClientService(dbContext);
            var clients = (await service.GetAllClientsAsync()).ToList();

            Assert.Single(clients);
            Assert.Equal("Active", clients[0].Name);
            Assert.False(clients[0].IsArchived);
        }
    }
}
