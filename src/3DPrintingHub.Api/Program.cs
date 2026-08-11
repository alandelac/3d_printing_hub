using _3DPrintingHub.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using _3DPrintingHub.Application;
using _3DPrintingHub.Api.Data;

var builder = WebApplication.CreateBuilder(args);

// 1. Configurar conexión a PostgreSQL
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(connectionString));

// 2. Controladores con soporte para Enums en texto
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
    });

// Register application and validation services
builder.Services.AddApplicationServices();

// Configure CORS to allow the Angular dev server during development
var allowedOrigins = builder.Configuration["AllowedOrigin"] ?? "http://localhost:4200";

builder.Services.AddCors(options =>
{
    options.AddPolicy(name: "AllowFrontend",
        policy =>   
        {
            policy.WithOrigins(allowedOrigins)
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

var app = builder.Build();

// 3. Ejecutar migraciones automáticas al arrancar el contenedor
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    dbContext.Database.Migrate();
    
    // 4. Seed default settings if table is empty
    await SettingsSeeder.SeedAsync(dbContext);
}

// Permite que la API reconozca los archivos del cliente de Blazor
app.UseHttpsRedirection();

app.UseRouting();
app.UseCors("AllowFrontend");
app.UseAuthorization();

app.MapControllers();

app.Run();