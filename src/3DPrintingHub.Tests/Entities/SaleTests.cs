using _3DPrintingHub.Domain.Entities;

namespace _3DPrintingHub.Tests.Entities;

public class SaleTests
{
    [Fact]
    public void Sale_WhenCreated_StoresExpectedValues()
    {
        var clientId = Guid.NewGuid();
        var productStockId = Guid.NewGuid();

        var sale = new Sale
        {
            ProductStockId = productStockId,
            ClientId = clientId,
            Quantity = 3,
            SalePrice = 12.50m,
            PaymentReceived = false,
            SoldAtUtc = DateTime.UtcNow
        };

        Assert.NotEqual(Guid.Empty, sale.Id);
        Assert.Equal(productStockId, sale.ProductStockId);
        Assert.Equal(clientId, sale.ClientId);
        Assert.Equal(3, sale.Quantity);
        Assert.Equal(12.50m, sale.SalePrice);
        Assert.False(sale.PaymentReceived);
        Assert.NotEqual(default, sale.SoldAtUtc);
    }
}
