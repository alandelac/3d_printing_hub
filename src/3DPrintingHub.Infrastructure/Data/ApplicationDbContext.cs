using Microsoft.EntityFrameworkCore;
using _3DPrintingHub.Domain.Entities;

namespace _3DPrintingHub.Infrastructure.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

    public DbSet<FilamentProfile> FilamentProfiles => Set<FilamentProfile>();
    public DbSet<Filament> Filaments => Set<Filament>();
    public DbSet<ModelPrint> ModelPrints => Set<ModelPrint>();
    public DbSet<PrintJob> PrintJobs => Set<PrintJob>();
    public DbSet<ProductStock> ProductStocks => Set<ProductStock>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Especificar precisión decimal para montos y pesos en PostgreSQL
        modelBuilder.Entity<FilamentProfile>()
            .Property(p => p.IroningFlowPercentage)
            .HasPrecision(5, 2);

        modelBuilder.Entity<Filament>()
            .Property(f => f.minCost)
            .HasPrecision(18, 2);

        modelBuilder.Entity<Filament>()
            .Property(f => f.maxCost)
            .HasPrecision(18, 2);

        modelBuilder.Entity<Filament>()
            .Property(f => f.lastCost)
            .HasPrecision(18, 2);

        // Relación 1:N entre FilamentProfile y Filament
        modelBuilder.Entity<Filament>()
            .HasOne(f => f.Profile)
            .WithMany(p => p.Filaments)
            .HasForeignKey(f => f.FilamentProfileId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}