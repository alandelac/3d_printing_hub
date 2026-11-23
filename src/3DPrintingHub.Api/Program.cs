using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using _3DPrintingHub.Application;
using _3DPrintingHub.Api.Data;
using _3DPrintingHub.Api.HealthChecks;
using _3DPrintingHub.Api.Middleware;
using _3DPrintingHub.Api.Services;
using _3DPrintingHub.Infrastructure.Data;

var builder = WebApplication.CreateBuilder(args);

// ====================================================
// 1. CONFIGURACIÓN DE SERVICIOS (Dependency Injection)
// ====================================================

// Base de Datos
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlite(connectionString));

// Autenticación e Identity (NUEVO)
builder.Services.AddAuthorization();
builder.Services.AddAuthentication();
builder.Services.AddProblemDetails();
builder.Services.AddHealthChecks()
    .AddCheck<DatabaseHealthCheck>("database");

builder.Services.AddTransient<IEmailSender<IdentityUser>, IdentityEmailSender>();
builder.Services.AddIdentityApiEndpoints<IdentityUser>()
    .AddEntityFrameworkStores<ApplicationDbContext>();

// Servicios de Aplicación (Application Layer)
builder.Services.AddApplicationServices();

// Controladores y Configuración JSON
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
    });

// CORS (Para tu frontend en Angular)
var allowedOrigins = builder.Configuration["AllowedOrigin"] ?? "http://localhost:4200";
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy => 
    {
        policy.WithOrigins(allowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});


// ====================================================
// 2. PIPELINE DE MIDDLEWARES (HTTP Request Pipeline)
// ====================================================

var app = builder.Build();

app.UseGlobalExceptionHandler();

// Migraciones automáticas y Seeding
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    dbContext.Database.Migrate();
    
    await SettingsSeeder.SeedAsync(dbContext);
    await dbContext.Database.ExecuteSqlRawAsync("UPDATE AspNetUsers SET EmailConfirmed = 1 WHERE EmailConfirmed = 0");
}

app.UseHttpsRedirection();
app.UseRouting();

app.UseCors("AllowFrontend");

// Seguridad (El orden es estricto: AuthN -> AuthZ)
app.UseAuthentication(); // <-- Agregado para validar el token
app.UseAuthorization();

// Mapeo de Endpoints
app.MapControllers();
// Liveness probe consumed by docker-compose.yml.
app.MapHealthChecks("/health");
app.MapIdentityApi<IdentityUser>(); // <-- Genera las rutas /login, /register, /manage/info, etc.

if (args.Length > 0 && args[0] == "--reset-password")
{
    using var scope = app.Services.CreateScope();
    var userManager = scope.ServiceProvider.GetRequiredService<UserManager<IdentityUser>>();
    var email = args.Length > 1 ? args[1] : null;
    var newPassword = args.Length > 2 ? args[2] : null;

    if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(newPassword))
    {
        Console.ForegroundColor = ConsoleColor.Red;
        Console.Error.WriteLine("Usage: dotnet run --project src/3DPrintingHub.Api -- --reset-password <email> <newPassword>");
        Console.ResetColor();
        Environment.ExitCode = 1;
        return;
    }

    var user = await userManager.FindByEmailAsync(email);
    if (user is null)
    {
        Console.ForegroundColor = ConsoleColor.Red;
        Console.Error.WriteLine($"User not found with email: {email}");
        Console.ResetColor();
        Environment.ExitCode = 1;
        return;
    }

    var resetToken = await userManager.GeneratePasswordResetTokenAsync(user);
    var result = await userManager.ResetPasswordAsync(user, resetToken, newPassword);
    if (!result.Succeeded)
    {
        Console.ForegroundColor = ConsoleColor.Red;
        Console.Error.WriteLine("Password reset failed:");
        foreach (var error in result.Errors)
        {
            Console.Error.WriteLine($" - {error.Description}");
        }
        Console.ResetColor();
        Environment.ExitCode = 1;
        return;
    }

    user.EmailConfirmed = true;
    await userManager.UpdateAsync(user);

    Console.ForegroundColor = ConsoleColor.Green;
    Console.WriteLine($"Password for user '{email}' was reset successfully.");
    Console.ResetColor();
    return;
}

app.Run();

public partial class Program { }