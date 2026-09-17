using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using _3DPrintingHub.Application;
using _3DPrintingHub.Api.Data;
using _3DPrintingHub.Api.Middleware;
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
builder.Services.AddHealthChecks();

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

app.Run();