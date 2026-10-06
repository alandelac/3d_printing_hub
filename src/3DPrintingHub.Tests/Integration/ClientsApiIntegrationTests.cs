using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Security.Claims;
using System.Text.Encodings.Web;
using System.Text.Json;
using System.Text.Json.Serialization;
using _3DPrintingHub.Application.Dtos;
using _3DPrintingHub.Domain.Entities;
using _3DPrintingHub.Infrastructure.Data;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace _3DPrintingHub.Tests.Integration;

public class ClientsApiIntegrationTests : IClassFixture<ClientsApiWebApplicationFactory>
{
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web)
    {
        Converters = { new JsonStringEnumConverter() }
    };

    private readonly ClientsApiWebApplicationFactory _factory;

    public ClientsApiIntegrationTests(ClientsApiWebApplicationFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task DeleteClient_WhenUnauthenticated_ReturnsUnauthorized()
    {
        var client = _factory.CreateClient(new WebApplicationFactoryClientOptions
        {
            AllowAutoRedirect = false
        });

        var response = await client.DeleteAsync($"/api/clients/{Guid.NewGuid()}");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task DeleteClient_WhenFound_ArchivesClientAndReturnsNoContent()
    {
        await using var scope = _factory.Services.CreateAsyncScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        var client = new Client
        {
            Name = "Archive me",
            ContactPlatform = ClientContactPlatform.WhatsApp,
            Phone = "+351999888777",
            Email = "archive@example.com"
        };

        await dbContext.Clients.AddAsync(client);
        await dbContext.SaveChangesAsync();

        var httpClient = _factory.CreateAuthenticatedClient();
        var response = await httpClient.DeleteAsync($"/api/clients/{client.Id}");

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);

        var persisted = await dbContext.Clients.AsNoTracking().SingleAsync(c => c.Id == client.Id);
        Assert.True(persisted.IsArchived);
    }

    [Fact]
    public async Task DeleteClient_WhenAlreadyArchived_ReturnsNoContent()
    {
        await using var scope = _factory.Services.CreateAsyncScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        var client = new Client
        {
            Name = "Already archived",
            ContactPlatform = ClientContactPlatform.Facebook,
            IsArchived = true
        };

        await dbContext.Clients.AddAsync(client);
        await dbContext.SaveChangesAsync();

        var httpClient = _factory.CreateAuthenticatedClient();
        var response = await httpClient.DeleteAsync($"/api/clients/{client.Id}");

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        var persisted = await dbContext.Clients.AsNoTracking().SingleAsync(c => c.Id == client.Id);
        Assert.True(persisted.IsArchived);
    }

    [Fact]
    public async Task DeleteClient_WhenMissing_ReturnsNotFound()
    {
        var httpClient = _factory.CreateAuthenticatedClient();
        var response = await httpClient.DeleteAsync($"/api/clients/{Guid.NewGuid()}");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task GetAllClients_ExcludesArchivedClients()
    {
        await using var scope = _factory.Services.CreateAsyncScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        await dbContext.Clients.AddRangeAsync(
            new Client { Name = "Active client", ContactPlatform = ClientContactPlatform.WhatsApp },
            new Client { Name = "Archived client", ContactPlatform = ClientContactPlatform.PhoneCall, IsArchived = true }
        );
        await dbContext.SaveChangesAsync();

        var httpClient = _factory.CreateAuthenticatedClient();
        var response = await httpClient.GetAsync("/api/clients");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var payload = await response.Content.ReadFromJsonAsync<List<ClientDto>>(JsonOptions);
        Assert.NotNull(payload);
        Assert.DoesNotContain(payload, c => c.Name == "Archived client");
        Assert.Contains(payload, c => c.Name == "Active client");
    }

    [Fact]
    public async Task GetClientById_WhenArchived_ReturnsArchivedClientDetail()
    {
        await using var scope = _factory.Services.CreateAsyncScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        var client = new Client
        {
            Name = "Archived detail",
            ContactPlatform = ClientContactPlatform.PhoneCall,
            IsArchived = true,
            Phone = "123",
            Email = "detail@example.com"
        };

        await dbContext.Clients.AddAsync(client);
        await dbContext.SaveChangesAsync();

        var httpClient = _factory.CreateAuthenticatedClient();
        var response = await httpClient.GetAsync($"/api/clients/{client.Id}");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var payload = await response.Content.ReadFromJsonAsync<ClientDto>(JsonOptions);
        Assert.NotNull(payload);
        Assert.True(payload.IsArchived);
        Assert.Equal("Archived detail", payload.Name);
    }
}

public class ClientsApiWebApplicationFactory : WebApplicationFactory<Program>
{
    private readonly SqliteConnection _connection;

    public ClientsApiWebApplicationFactory()
    {
        var dbPath = Path.Combine(Path.GetTempPath(), $"clients-api-test-{Guid.NewGuid():N}.db");
        _connection = new SqliteConnection($"Data Source={dbPath}");
        _connection.Open();
    }

    public HttpClient CreateAuthenticatedClient()
    {
        var client = CreateClient(new WebApplicationFactoryClientOptions
        {
            AllowAutoRedirect = false
        });

        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Test");
        return client;
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Development");

        builder.ConfigureServices(services =>
        {
            services.RemoveAll<DbContextOptions<ApplicationDbContext>>();
            services.RemoveAll<ApplicationDbContext>();

            services.AddDbContext<ApplicationDbContext>(options =>
            {
                options.UseSqlite(_connection);
            });

            var dbContext = new ApplicationDbContext(new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseSqlite(_connection)
                .Options);
            dbContext.Database.Migrate();

            services.AddAuthentication("Test")
                .AddScheme<AuthenticationSchemeOptions, TestAuthenticationHandler>("Test", _ => { });

            services.PostConfigureAll<AuthenticationOptions>(options =>
            {
                options.DefaultAuthenticateScheme = "Test";
                options.DefaultChallengeScheme = "Test";
                options.DefaultScheme = "Test";
            });
        });
    }

    protected override void Dispose(bool disposing)
    {
        if (disposing)
        {
            _connection.Dispose();
        }

        base.Dispose(disposing);
    }
}

public class TestAuthenticationHandler(
    IOptionsMonitor<AuthenticationSchemeOptions> options,
    ILoggerFactory logger,
    UrlEncoder encoder)
    : AuthenticationHandler<AuthenticationSchemeOptions>(options, logger, encoder)
{
    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        var authHeader = Request.Headers.Authorization.ToString();
        var isTestAuthHeader = authHeader.Equals("Test", StringComparison.OrdinalIgnoreCase)
            || authHeader.StartsWith("Test ", StringComparison.OrdinalIgnoreCase);

        if (string.IsNullOrWhiteSpace(authHeader) || !isTestAuthHeader)
        {
            return Task.FromResult(AuthenticateResult.NoResult());
        }

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, "integration-test-user"),
            new Claim(ClaimTypes.Name, "integration-test-user")
        };

        var identity = new ClaimsIdentity(claims, Scheme.Name);
        var principal = new ClaimsPrincipal(identity);
        var ticket = new AuthenticationTicket(principal, Scheme.Name);

        return Task.FromResult(AuthenticateResult.Success(ticket));
    }
}
