using _3DPrintingHub.Domain.Entities;
using _3DPrintingHub.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

// Usage:
//   dotnet run --project src/3DPrintingHub.DataMigration -- "<postgresConnectionString>" "<sqliteFilePath>"
//
// Example (Postgres from the old docker-compose was exposed on localhost:5432):
//   dotnet run --project src/3DPrintingHub.DataMigration -- \
//     "Host=localhost;Port=5432;Database=printinghub;Username=postgres;Password=supersecretpassword;" \
//     "./printinghub.db"
//
// It reads every table from the PostgreSQL database and copies it into a fresh SQLite
// database file, preserving the original GUID ids so all relationships stay intact.

if (args.Length < 2)
{
    Console.Error.WriteLine("Usage: dotnet run --project src/3DPrintingHub.DataMigration -- <postgresConnectionString> <sqliteFilePath>");
    return 1;
}

var postgresConnectionString = args[0];
var sqliteFilePath = Path.GetFullPath(args[1]);

var sqliteDir = Path.GetDirectoryName(sqliteFilePath);
if (!string.IsNullOrEmpty(sqliteDir)) Directory.CreateDirectory(sqliteDir);

var pgOptions = new DbContextOptionsBuilder<ApplicationDbContext>().UseNpgsql(postgresConnectionString).Options;
var sqliteOptions = new DbContextOptionsBuilder<ApplicationDbContext>().UseSqlite($"Data Source={sqliteFilePath}").Options;

using var source = new ApplicationDbContext(pgOptions);
using var target = new ApplicationDbContext(sqliteOptions);

Console.WriteLine("Creating SQLite database schema...");
target.Database.Migrate();

// Copy tables in foreign-key-safe order (parents before children).
// Ids are preserved, so explicit keys keep every relationship consistent.
Copy(source, target, source.Brands, target.Brands);
Copy(source, target, source.MaterialTypes, target.MaterialTypes);
Copy(source, target, source.Marketplaces, target.Marketplaces);
Copy(source, target, source.ModelPrintCategories, target.ModelPrintCategories);
Copy(source, target, source.Settings, target.Settings);
Copy(source, target, source.FilamentColors, target.FilamentColors);
Copy(source, target, source.FilamentProfiles, target.FilamentProfiles);
Copy(source, target, source.Filaments, target.Filaments);
Copy(source, target, source.ModelPrints, target.ModelPrints);
Copy(source, target, source.ProductStocks, target.ProductStocks);
Copy(source, target, source.PublishedModels, target.PublishedModels);
Copy(source, target, source.PrintJobs, target.PrintJobs);

Console.WriteLine();
Console.WriteLine($"Migration complete. SQLite database written to: {sqliteFilePath}");
return 0;

static void Copy<T>(ApplicationDbContext source, ApplicationDbContext target, DbSet<T> sourceSet, DbSet<T> targetSet) where T : class
{
    var rows = sourceSet.AsNoTracking().ToList();

    if (rows.Count == 0)
    {
        Console.WriteLine($"  {typeof(T).Name,-18} 0 rows (nothing to copy).");
        return;
    }

    if (targetSet.Any())
    {
        Console.WriteLine($"  {typeof(T).Name,-18} SKIPPED - destination already has data.");
        return;
    }

    targetSet.AddRange(rows);
    target.SaveChanges();

    Console.WriteLine($"  {typeof(T).Name,-18} {rows.Count,5} rows copied.");
}
