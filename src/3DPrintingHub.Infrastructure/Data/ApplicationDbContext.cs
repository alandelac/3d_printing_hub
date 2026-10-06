using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using _3DPrintingHub.Domain.Entities;

namespace _3DPrintingHub.Infrastructure.Data;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : IdentityDbContext<IdentityUser>(options){
    public DbSet<Client> Clients => Set<Client>();
    public DbSet<Brand> Brands => Set<Brand>();
    public DbSet<MaterialType> MaterialTypes => Set<MaterialType>();
    public DbSet<Marketplace> Marketplaces => Set<Marketplace>();
    public DbSet<ModelPrintCategory> ModelPrintCategories => Set<ModelPrintCategory>();
    public DbSet<Settings> Settings => Set<Settings>();

    public DbSet<FilamentProfile> FilamentProfiles => Set<FilamentProfile>();
    public DbSet<FilamentColor> FilamentColors => Set<FilamentColor>();
    public DbSet<Filament> Filaments => Set<Filament>();
    public DbSet<WeightAdjustmentLog> WeightAdjustmentLogs => Set<WeightAdjustmentLog>();
    public DbSet<ModelPrint> ModelPrints => Set<ModelPrint>();
    public DbSet<ProductStock> ProductStocks => Set<ProductStock>();
    public DbSet<Sale> Sales => Set<Sale>();
    public DbSet<PublishedModels> PublishedModels => Set<PublishedModels>();
    public DbSet<PrintJob> PrintJobs => Set<PrintJob>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Client>(entity =>
        {
            entity.Property(c => c.Name).HasMaxLength(200);
            entity.Property(c => c.Phone).HasMaxLength(30);
            entity.Property(c => c.Email).HasMaxLength(254);
            entity.HasIndex(c => c.Name);

            entity.HasMany(c => c.Sales)
                .WithOne(s => s.Client)
                .HasForeignKey(s => s.ClientId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Brand>()
            .HasIndex(b => b.Name)
            .IsUnique();

        modelBuilder.Entity<MaterialType>()
            .HasIndex(mt => mt.Name)
            .IsUnique();

        modelBuilder.Entity<FilamentColor>()
            .HasIndex(fc => fc.Name)
            .IsUnique();

        modelBuilder.Entity<Marketplace>()
            .HasIndex(m => m.Name)
            .IsUnique();

        modelBuilder.Entity<ModelPrintCategory>()
            .HasIndex(c => c.Name)
            .IsUnique();

        modelBuilder.Entity<Settings>()
            .HasIndex(s => s.parameter)
            .IsUnique();

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

            // Ensure only one profile per Brand + Material Type combination
            entity.HasIndex(p => new { p.BrandId, p.MaterialTypeId }).IsUnique();
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

        modelBuilder.Entity<WeightAdjustmentLog>(entity =>
        {
            entity.Property(log => log.UserId).HasMaxLength(128);
            entity.Property(log => log.Reason).HasMaxLength(500);

            entity.HasOne(log => log.Filament)
                .WithMany(f => f.WeightAdjustmentLogs)
                .HasForeignKey(log => log.FilamentId)
                .OnDelete(DeleteBehavior.Cascade);
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
            entity.Property(ps => ps.RecommendedSalePrice).HasPrecision(18, 2);
            entity.Property(ps => ps.SalePrice).HasPrecision(18, 2);
            entity.Property(ps => ps.Version).IsConcurrencyToken();
            entity.ToTable(table => table.HasCheckConstraint(
                "CK_ProductStocks_QuantityInStock_NonNegative",
                "QuantityInStock >= 0"));
            entity.HasIndex(ps => new { ps.ModelPrintId, ps.FilamentId }).IsUnique();

            entity.HasOne(ps => ps.ModelPrint)
                .WithMany(mp => mp.ProductStocks)
                .HasForeignKey(ps => ps.ModelPrintId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(ps => ps.Filament)
                .WithMany(f => f.ProductStocks)
                .HasForeignKey(ps => ps.FilamentId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasMany(ps => ps.Sales)
                .WithOne(s => s.ProductStock)
                .HasForeignKey(s => s.ProductStockId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Sale>(entity =>
        {
            entity.Property(s => s.SalePrice).HasPrecision(18, 2);
            entity.Property(s => s.SoldAtUtc).HasDefaultValueSql("CURRENT_TIMESTAMP");
            entity.HasIndex(s => s.ProductStockId);
            entity.HasIndex(s => s.ClientId);
            entity.HasIndex(s => s.SoldAtUtc);
            entity.ToTable(table =>
            {
                table.HasCheckConstraint("CK_Sales_Quantity_Positive", "Quantity > 0");
                table.HasCheckConstraint("CK_Sales_Price_Positive", "SalePrice > 0");
            });
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
            entity.Property(j => j.UsedWeightGrams).HasPrecision(18, 2);
            entity.Property(j => j.CalculatedMaterialCost).HasPrecision(18, 2);
            entity.ToTable(table => table.HasCheckConstraint(
                "CK_PrintJobs_ProducedQuantity_Positive",
                "ProducedQuantity > 0"));
            entity.ToTable(table => table.HasCheckConstraint(
                "CK_PrintJobs_UsedWeightGrams_Positive",
                "UsedWeightGrams > 0"));

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
