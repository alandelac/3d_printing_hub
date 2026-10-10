using _3DPrintingHub.Application.Dtos;
using _3DPrintingHub.Application.Validators;
using System.Text.Json;

namespace _3DPrintingHub.Tests.Validators;

public class ProductStockUpdateDtoValidatorTests
{
    private readonly ProductStockUpdateDtoValidator _validator = new();

    [Theory]
    [InlineData(0)]
    [InlineData(2)]
    public void Validate_WhenMinimumInventoryQuantityIsNonNegative_ReturnsValidResult(int quantity)
    {
        var result = _validator.Validate(new ProductStockUpdateDto
        {
            Id = Guid.NewGuid(),
            MinimumInventoryQuantity = quantity
        });

        Assert.True(result.IsValid);
    }

    [Fact]
    public void Validate_WhenMinimumInventoryQuantityIsNegative_ReturnsValidationError()
    {
        var result = _validator.Validate(new ProductStockUpdateDto
        {
            Id = Guid.NewGuid(),
            MinimumInventoryQuantity = -1
        });

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, error => error.PropertyName == nameof(ProductStockUpdateDto.MinimumInventoryQuantity));
    }

    [Fact]
    public void Deserialize_WhenMinimumInventoryQuantityIsFractional_ThrowsJsonException()
    {
        const string json = "{\"MinimumInventoryQuantity\":1.5}";

        Assert.Throws<JsonException>(() => JsonSerializer.Deserialize<ProductStockUpdateDto>(json));
    }
}