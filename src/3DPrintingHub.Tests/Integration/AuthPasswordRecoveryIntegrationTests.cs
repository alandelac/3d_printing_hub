using System.Net;
using System.Net.Http.Json;
using _3DPrintingHub.Infrastructure.Data;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;

namespace _3DPrintingHub.Tests.Integration;

public class TestEmailSender : IEmailSender<IdentityUser>
{
    public string? LastResetCode { get; private set; }
    public string? LastResetEmail { get; private set; }

    public Task SendPasswordResetCodeAsync(IdentityUser user, string email, string resetCode)
    {
        LastResetEmail = email;
        LastResetCode = resetCode;
        return Task.CompletedTask;
    }

    public Task SendPasswordResetLinkAsync(IdentityUser user, string email, string resetLink)
    {
        return Task.CompletedTask;
    }

    public Task SendConfirmationLinkAsync(IdentityUser user, string email, string confirmationLink)
    {
        return Task.CompletedTask;
    }
}

public class AuthPasswordRecoveryWebApplicationFactory : WebApplicationFactory<Program>
{
    private readonly SqliteConnection _connection = new("Data Source=:memory:");
    public TestEmailSender TestEmailSender { get; } = new();

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");

        builder.ConfigureServices(services =>
        {
            services.RemoveAll<DbContextOptions<ApplicationDbContext>>();
            services.RemoveAll<ApplicationDbContext>();
            services.RemoveAll<IEmailSender<IdentityUser>>();

            _connection.Open();

            services.AddDbContext<ApplicationDbContext>(options =>
            {
                options.UseSqlite(_connection);
            });

            services.AddSingleton<IEmailSender<IdentityUser>>(TestEmailSender);

            var dbContext = new ApplicationDbContext(new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseSqlite(_connection)
                .Options);
            dbContext.Database.Migrate();
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

public class AuthPasswordRecoveryIntegrationTests : IClassFixture<AuthPasswordRecoveryWebApplicationFactory>
{
    private readonly AuthPasswordRecoveryWebApplicationFactory _factory;

    public AuthPasswordRecoveryIntegrationTests(AuthPasswordRecoveryWebApplicationFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task ForgotPassword_WhenUserExists_TriggersResetCodeGeneration()
    {
        var client = _factory.CreateClient();

        var userEmail = "recovery-test@example.com";
        var password = "InitialPassword123!";
        var registerResponse = await client.PostAsJsonAsync("/register", new { email = userEmail, password });
        Assert.True(registerResponse.IsSuccessStatusCode);

        var forgotResponse = await client.PostAsJsonAsync("/forgotPassword", new { email = userEmail });
        Assert.Equal(HttpStatusCode.OK, forgotResponse.StatusCode);

        Assert.Equal(userEmail, _factory.TestEmailSender.LastResetEmail);
        Assert.NotNull(_factory.TestEmailSender.LastResetCode);
        Assert.NotEmpty(_factory.TestEmailSender.LastResetCode);

        var newPassword = "NewSecurePassword456!";
        var resetResponse = await client.PostAsJsonAsync("/resetPassword", new
        {
            email = userEmail,
            resetCode = _factory.TestEmailSender.LastResetCode,
            newPassword
        });
        Assert.Equal(HttpStatusCode.OK, resetResponse.StatusCode);

        var loginResponse = await client.PostAsJsonAsync("/login", new { email = userEmail, password = newPassword });
        Assert.Equal(HttpStatusCode.OK, loginResponse.StatusCode);

        var oldLoginResponse = await client.PostAsJsonAsync("/login", new { email = userEmail, password });
        Assert.False(oldLoginResponse.IsSuccessStatusCode);
    }

    [Fact]
    public async Task ResetPassword_WithInvalidCode_ReturnsValidationProblem()
    {
        var client = _factory.CreateClient();

        var response = await client.PostAsJsonAsync("/resetPassword", new
        {
            email = "nonexistent@example.com",
            resetCode = "invalid-code",
            newPassword = "SomePassword123!"
        });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }
}
