using _3DPrintingHub.Infrastructure.Data;
using _3DPrintingHub.Application.Services;
using _3DPrintingHub.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;

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

// Register application services implemented in Infrastructure
builder.Services.AddScoped<IFilamentService, FilamentService>();
builder.Services.AddScoped<IFilamentColorService, FilamentColorService>();

var app = builder.Build();

// 3. Ejecutar migraciones automáticas al arrancar el contenedor
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    dbContext.Database.Migrate();
}

// Permite que la API reconozca los archivos del cliente de Blazor
app.UseHttpsRedirection();

app.UseRouting();
app.UseAuthorization();

app.MapControllers();

app.Run();