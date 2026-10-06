namespace _3DPrintingHub.Application.Dtos;

public class SaleDto
{
    public Guid Id { get; set; }

    public Guid ProductStockId { get; set; }

    public Guid? ClientId { get; set; }

    public string? ClientName { get; set; }

    public int Quantity { get; set; }

    public decimal SalePrice { get; set; }

    public bool PaymentReceived { get; set; }

    public DateTime SoldAtUtc { get; set; }
}
