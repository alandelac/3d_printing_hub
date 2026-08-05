namespace _3DPrintingHub.Domain.Entities;

public class PublishedModels
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public int Published {get; set; } // 1 yes, 2 no, 3 N/A
    public Guid MarketplaceId { get; set; }
    public Marketplace? Marketplace { get; set; }
    public Guid ProductStockId { get; set; }
    public ProductStock? ProductStock { get; set; }
}