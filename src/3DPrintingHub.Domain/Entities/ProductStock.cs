namespace _3DPrintingHub.Domain.Entities;

public class ProductStock
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid ModelPrintId { get; set; }
    public ModelPrint? ModelPrint { get; set; }

    public Guid FilamentId { get; set; }
    public Filament? Filament { get; set; }

    public int QuantityInStock { get; set; }
    public decimal CostToProduce { get; set; }
    public decimal RecommendedSalePrice { get; set; }
    public decimal SalePrice { get; set; }
    public DateTime LastUpdated { get; set; } = DateTime.UtcNow;

    public ICollection<PublishedModels> PublishedModels { get; set; } = [];
}