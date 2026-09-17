using _3DPrintingHub.Application.Dtos;
using _3DPrintingHub.Application.Validators;

namespace _3DPrintingHub.Tests.Validators;

public class BrandCreateDtoValidatorTests
{
    private readonly BrandCreateDtoValidator _validator = new();

    [Fact]
    public void Validate_WhenNameIsEmpty_ReturnsValidationError()
    {
        var dto = new BrandCreateDto { Name = string.Empty };

        var result = _validator.Validate(dto);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, error => error.PropertyName == nameof(BrandCreateDto.Name));
    }

    [Fact]
    public void Validate_WhenNameIsLongerThanOneHundredCharacters_ReturnsValidationError()
    {
        var dto = new BrandCreateDto { Name = new string('A', 101) };

        var result = _validator.Validate(dto);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, error => error.PropertyName == nameof(BrandCreateDto.Name));
    }
}
