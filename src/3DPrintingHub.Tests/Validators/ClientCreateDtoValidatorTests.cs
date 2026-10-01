using _3DPrintingHub.Application.Dtos;
using _3DPrintingHub.Domain.Entities;
using _3DPrintingHub.Application.Validators;

namespace _3DPrintingHub.Tests.Validators;

public class ClientCreateDtoValidatorTests
{
    private readonly ClientCreateDtoValidator _validator = new();

    [Fact]
    public void Validate_WhenNameIsEmpty_ReturnsValidationError()
    {
        var dto = new ClientCreateDto
        {
            Name = string.Empty,
            ContactPlatform = ClientContactPlatform.WhatsApp
        };

        var result = _validator.Validate(dto);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, error => error.PropertyName == nameof(ClientCreateDto.Name));
    }

    [Fact]
    public void Validate_WhenContactPlatformIsUnsupported_ReturnsValidationError()
    {
        var dto = new ClientCreateDto
        {
            Name = "Test Client",
            ContactPlatform = (ClientContactPlatform)999
        };

        var result = _validator.Validate(dto);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, error => error.PropertyName == nameof(ClientCreateDto.ContactPlatform));
    }

    [Fact]
    public void Validate_WhenDtoIsValid_ReturnsValidResult()
    {
        var dto = new ClientCreateDto
        {
            Name = "Test Client",
            ContactPlatform = ClientContactPlatform.WhatsApp,
            Phone = "+351912345678",
            Email = "test@example.com"
        };

        var result = _validator.Validate(dto);

        Assert.True(result.IsValid);
    }
}
