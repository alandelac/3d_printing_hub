namespace _3DPrintingHub.Domain.Entities;

public class Sale
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid ProductStockId { get; set; }
    public ProductStock? ProductStock { get; set; }

    public Guid? ClientId { get; set; }
    public Client? Client { get; set; }

    public int Quantity { get; set; }
    public decimal SalePrice { get; set; }
    public bool PaymentReceived { get; set; }
    public DateTime SoldAtUtc { get; set; } = DateTime.UtcNow;
}
