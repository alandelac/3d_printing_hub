using Microsoft.EntityFrameworkCore;
using _3DPrintingHub.Domain.Entities;

namespace _3DPrintingHub.Infrastructure.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

    public DbSet<Brand> Brands => Set<Brand>();
    public DbSet<MaterialType> MaterialTypes => Set<MaterialType>();
    public DbSet<Marketplace> Marketplaces => Set<Marketplace>();
    public DbSet<ModelPrintCategory> ModelPrintCategories => Set<ModelPrintCategory>();
    public DbSet<Settings> Settings => Set<Settings>();

    public DbSet<FilamentProfile> FilamentProfiles => Set<FilamentProfile>();
    public DbSet<FilamentColor> FilamentColors => Set<FilamentColor>();
    public DbSet<Filament> Filaments => Set<Filament>();
    public DbSet<ModelPrint> ModelPrints => Set<ModelPrint>();
    public DbSet<ProductStock> ProductStocks => Set<ProductStock>();
    public DbSet<PublishedModels> PublishedModels => Set<PublishedModels>();
    public DbSet<PrintJob> PrintJobs => Set<PrintJob>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<FilamentProfile>(entity =>
        {
            entity.Property(p => p.IroningFlowPercentage).HasPrecision(5, 2);

            entity.HasOne(p => p.BrandName)
                .WithMany()
                .HasForeignKey(p => p.BrandId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(p => p.MaterialType)
                .WithMany()
                .HasForeignKey(p => p.MaterialTypeId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Filament>(entity =>
        {
            entity.Property(f => f.MinCost).HasPrecision(18, 2);
            entity.Property(f => f.MaxCost).HasPrecision(18, 2);
            entity.Property(f => f.LastCost).HasPrecision(18, 2);

            entity.HasOne(f => f.Profile)
                .WithMany(p => p.Filaments)
                .HasForeignKey(f => f.FilamentProfileId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(f => f.Color)
                .WithMany(c => c.Filaments)
                .HasForeignKey(f => f.FilamentColorId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<ModelPrint>(entity =>
        {
            entity.HasOne(m => m.Category)
                .WithMany(c => c.ModelPrints)
                .HasForeignKey(m => m.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<ProductStock>(entity =>
        {
            entity.Property(ps => ps.CostToProduce).HasPrecision(18, 2);
            entity.Property(ps => ps.SalePrice).HasPrecision(18, 2);

            entity.HasOne(ps => ps.ModelPrint)
                .WithMany(mp => mp.ProductStocks)
                .HasForeignKey(ps => ps.ModelPrintId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(ps => ps.Filament)
                .WithMany(f => f.ProductStocks)
                .HasForeignKey(ps => ps.FilamentId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<PublishedModels>(entity =>
        {
            entity.HasOne(pm => pm.Marketplace)
                .WithMany(m => m.PublishedModels)
                .HasForeignKey(pm => pm.MarketplaceId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(pm => pm.ProductStock)
                .WithMany(ps => ps.PublishedModels)
                .HasForeignKey(pm => pm.ProductStockId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<PrintJob>(entity =>
        {
            entity.Property(j => j.CalculatedMaterialCost).HasPrecision(18, 2);

            entity.HasOne(j => j.Filament)
                .WithMany()
                .HasForeignKey(j => j.FilamentId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(j => j.ModelPrint)
                .WithMany()
                .HasForeignKey(j => j.ModelPrintId)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }
}
