namespace _3DPrintingHub.Application.Dtos;

public class ProductStockDto
{
    public Guid Id { get; set; }

    public Guid ModelPrintId { get; set; }

    public string ModelPrintName { get; set; } = string.Empty;

    public Guid FilamentId { get; set; }

    public string FilamentColorName { get; set; } = string.Empty;

    public string FilamentColorCode { get; set; } = string.Empty;

    public int QuantityInStock { get; set; }

    public decimal CostToProduce { get; set; }

    public decimal SalePrice { get; set; }

    public DateTime LastUpdated { get; set; }
}
