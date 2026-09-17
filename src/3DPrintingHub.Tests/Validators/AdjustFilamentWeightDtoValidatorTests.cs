using _3DPrintingHub.Application.Dtos;
using _3DPrintingHub.Application.Validators;

namespace _3DPrintingHub.Tests.Validators;

public class AdjustFilamentWeightDtoValidatorTests
{
    private readonly AdjustFilamentWeightDtoValidator _validator = new();

    [Fact]
    public void Validate_WhenFilamentIdIsEmpty_ReturnsValidationError()
    {
        var dto = new AdjustFilamentWeightDto
        {
            FilamentId = Guid.Empty,
            Grams = 25
        };

        var result = _validator.Validate(dto);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, error => error.PropertyName == nameof(AdjustFilamentWeightDto.FilamentId));
    }

    [Fact]
    public void Validate_WhenGramsIsZero_ReturnsValidationError()
    {
        var dto = new AdjustFilamentWeightDto
        {
            FilamentId = Guid.NewGuid(),
            Grams = 0
        };

        var result = _validator.Validate(dto);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, error => error.PropertyName == nameof(AdjustFilamentWeightDto.Grams));
    }
}
