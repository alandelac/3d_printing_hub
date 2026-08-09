using _3DPrintingHub.Application.Dtos;
using FluentValidation;

namespace _3DPrintingHub.Application.Validators;

public class AdjustFilamentWeightDtoValidator : AbstractValidator<AdjustFilamentWeightDto>
{
    public AdjustFilamentWeightDtoValidator()
    {
        RuleFor(x => x.FilamentId)
            .NotEmpty().WithMessage("Filament id is required.");

        RuleFor(x => x.Grams)
            .NotEqual(0).WithMessage("Grams must be a non-zero whole number.");
    }
}
