using _3DPrintingHub.Application.Dtos;
using _3DPrintingHub.Application.Validators;

namespace _3DPrintingHub.Tests.Validators;

public class SaleCreateDtoValidatorTests
{
    private readonly SaleCreateDtoValidator _validator = new();

    [Fact]
    public void Validate_WhenDtoIsValid_ReturnsValidResult()
    {
        var dto = new SaleCreateDto
        {
            ProductStockId = Guid.NewGuid(),
            ClientId = Guid.NewGuid(),
            Quantity = 2,
            SalePrice = 10.00m,
            PaymentReceived = true
        };

        var result = _validator.Validate(dto);

        Assert.True(result.IsValid);
    }

    [Fact]
    public void Validate_WhenPaymentReceivedIsMissing_ReturnsValidationError()
    {
        var dto = new SaleCreateDto
        {
            ProductStockId = Guid.NewGuid(),
            Quantity = 2,
            SalePrice = 10.00m,
            PaymentReceived = null
        };

        var result = _validator.Validate(dto);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, error => error.PropertyName == nameof(SaleCreateDto.PaymentReceived));
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-5)]
    public void Validate_WhenQuantityIsNotPositive_ReturnsValidationError(int quantity)
    {
        var dto = new SaleCreateDto
        {
            ProductStockId = Guid.NewGuid(),
            Quantity = quantity,
            SalePrice = 5m,
            PaymentReceived = true
        };

        var result = _validator.Validate(dto);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, error => error.PropertyName == nameof(SaleCreateDto.Quantity));
    }
}
