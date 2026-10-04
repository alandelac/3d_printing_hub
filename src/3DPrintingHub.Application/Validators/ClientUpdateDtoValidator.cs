using _3DPrintingHub.Application.Dtos;
using FluentValidation;

namespace _3DPrintingHub.Application.Validators;

public class ClientUpdateDtoValidator : AbstractValidator<ClientUpdateDto>
{
    public ClientUpdateDtoValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Client id is required.");

        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Client name is required.")
            .MaximumLength(200).WithMessage("Client name must not exceed 200 characters.");

        RuleFor(x => x.ContactPlatform)
            .IsInEnum().WithMessage("A valid contact platform is required.");

        When(x => !string.IsNullOrWhiteSpace(x.Phone), () =>
        {
            RuleFor(x => x.Phone)
                .MaximumLength(30).WithMessage("Phone number must not exceed 30 characters.")
                .Matches("^\\+?[0-9\\s\\-()]+$").WithMessage("Phone number is not in a valid format.");
        });

        When(x => !string.IsNullOrWhiteSpace(x.Email), () =>
        {
            RuleFor(x => x.Email)
                .MaximumLength(254).WithMessage("Email must not exceed 254 characters.")
                .EmailAddress().WithMessage("Email is not in a valid format.");
        });
    }
}
