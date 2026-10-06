using _3DPrintingHub.Application.Dtos;
using _3DPrintingHub.Application.Validators;

namespace _3DPrintingHub.Tests.Validators;

public class SettingCreateDtoValidatorTests
{
    private readonly SettingCreateDtoValidator _validator = new();

    [Theory]
    [InlineData(0)]
    [InlineData(2)]
    [InlineData(2147483647)]
    public void Validate_WhenMinimumInventoryValueIsNonNegativeInteger_ReturnsValidResult(decimal value)
    {
        var result = _validator.Validate(new SettingCreateDto
        {
            Parameter = "minimum_inventory_quantity",
            Value = value
        });

        Assert.True(result.IsValid);
    }

    [Theory]
    [InlineData(-1)]
    [InlineData(1.5)]
    [InlineData(2147483648)]
    public void Validate_WhenMinimumInventoryValueIsNotSupportedInteger_ReturnsValidationError(decimal value)
    {
        var result = _validator.Validate(new SettingCreateDto
        {
            Parameter = "minimum_inventory_quantity",
            Value = value
        });

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, error => error.PropertyName == nameof(SettingCreateDto.Value));
    }

    [Fact]
    public void Validate_WhenOtherSettingIsFractional_DoesNotChangeExistingSettingBehavior()
    {
        var result = _validator.Validate(new SettingCreateDto
        {
            Parameter = "misprint_error_rate",
            Value = 0.2m
        });

        Assert.True(result.IsValid);
    }
}