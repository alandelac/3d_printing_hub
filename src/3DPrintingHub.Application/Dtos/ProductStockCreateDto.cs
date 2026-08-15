namespace _3DPrintingHub.Application.Dtos;

public class ProductStockCreateDto
{
    /// <summary>
    /// Required: The Id of the ModelPrint this stock item refers to.
    /// </summary>
    public Guid ModelPrintId { get; set; }

    /// <summary>
    /// Required: The Id of the Filament used to produce this stock item.
    /// </summary>
    public Guid FilamentId { get; set; }

    /// <summary>
    /// Required: The quantity of items in stock.
    /// </summary>
    public int QuantityInStock { get; set; }

    /// <summary>
    /// Required: The sale price of one unit.
    /// </summary>
    public decimal SalePrice { get; set; }
}
