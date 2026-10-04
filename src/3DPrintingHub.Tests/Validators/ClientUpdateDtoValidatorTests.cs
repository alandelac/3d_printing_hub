using _3DPrintingHub.Application.Dtos;
using _3DPrintingHub.Application.Validators;
using _3DPrintingHub.Domain.Entities;

namespace _3DPrintingHub.Tests.Validators;

public class ClientUpdateDtoValidatorTests
{
    private readonly ClientUpdateDtoValidator _validator = new();

    [Fact]
    public void Validate_WhenUpdateDtoIsValid_ReturnsValidResult()
    {
        var dto = new ClientUpdateDto
        {
            Id = Guid.NewGuid(),
            Name = "Updated Client",
            ContactPlatform = ClientContactPlatform.Facebook,
            Email = "updated@example.com"
        };

        var result = _validator.Validate(dto);

        Assert.True(result.IsValid);
    }

    [Fact]
    public void Validate_WhenUpdatePhoneIsMalformed_ReturnsValidationError()
    {
        var dto = new ClientUpdateDto
        {
            Id = Guid.NewGuid(),
            Name = "Updated Client",
            ContactPlatform = ClientContactPlatform.PhoneCall,
            Phone = "invalid-phone-letters"
        };

        var result = _validator.Validate(dto);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, error => error.PropertyName == nameof(ClientUpdateDto.Phone));
    }
}
