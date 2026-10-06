namespace _3DPrintingHub.Application.Dtos;

public class SaleUpdateDto
{
    public Guid Id { get; set; }

    public Guid ProductStockId { get; set; }

    public Guid? ClientId { get; set; }

    public int Quantity { get; set; }

    public decimal SalePrice { get; set; }

    public bool? PaymentReceived { get; set; }
}
