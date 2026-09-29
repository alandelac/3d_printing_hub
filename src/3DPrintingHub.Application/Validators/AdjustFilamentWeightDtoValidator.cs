using _3DPrintingHub.Application.Dtos;
using FluentValidation;

namespace _3DPrintingHub.Application.Validators;

public class AdjustFilamentWeightDtoValidator : AbstractValidator<AdjustFilamentWeightDto>
{
    public AdjustFilamentWeightDtoValidator()
    {
        RuleFor(x => x.FilamentId)
            .NotEmpty().WithMessage("Filament id is required.");

        RuleFor(x => x.Amount)
            .NotEqual(0m).WithMessage("Amount must be a non-zero value.");

        RuleFor(x => x.Reason)
            .NotEmpty().WithMessage("A reason is required for the adjustment.")
            .MaximumLength(500).WithMessage("Reason cannot exceed 500 characters.");
    }
}
