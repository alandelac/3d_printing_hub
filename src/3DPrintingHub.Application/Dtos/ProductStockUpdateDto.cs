namespace _3DPrintingHub.Application.Dtos;

public class ProductStockUpdateDto
{
    /// <summary>
    /// Required: The Id of the ProductStock to update.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Optional: The Id of the ModelPrint this stock item refers to.
    /// </summary>
    public Guid? ModelPrintId { get; set; }

    /// <summary>
    /// Optional: The Id of the Filament used to produce this stock item.
    /// </summary>
    public Guid? FilamentId { get; set; }

    /// <summary>
    /// Optional: The quantity of items in stock.
    /// </summary>
    public int? QuantityInStock { get; set; }

    /// <summary>
    /// Optional: The cost to produce one unit.
    /// </summary>
    public decimal? CostToProduce { get; set; }

    /// <summary>
    /// Optional: The sale price of one unit.
    /// </summary>
    public decimal? SalePrice { get; set; }
}
