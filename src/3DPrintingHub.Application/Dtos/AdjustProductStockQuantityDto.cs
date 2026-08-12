namespace _3DPrintingHub.Application.Dtos;

/// <summary>
/// DTO for adjusting the quantity in stock of a ProductStock.
/// Positive values add to the stock, negative values reduce it.
/// </summary>
public class AdjustProductStockQuantityDto
{
    /// <summary>
    /// The Id of the ProductStock to adjust.
    /// </summary>
    public Guid ProductStockId { get; set; }

    /// <summary>
    /// The amount to add (positive) or reduce (negative) from the stock.
    /// Must be a non-zero whole number.
    /// </summary>
    public int Quantity { get; set; }
}
