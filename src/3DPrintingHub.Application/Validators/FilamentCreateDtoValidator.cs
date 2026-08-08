using _3DPrintingHub.Application.Dtos;
using FluentValidation;

namespace _3DPrintingHub.Application.Validators;

public class FilamentCreateDtoValidator : AbstractValidator<FilamentCreateDto>
{
    public FilamentCreateDtoValidator()
    {
        RuleFor(x => x.FilamentProfileId)
            .NotEmpty().WithMessage("Filament profile is required.");

        RuleFor(x => x.FilamentColorId)
            .NotEmpty().WithMessage("Filament color is required.");

        RuleFor(x => x.MinCost)
            .GreaterThanOrEqualTo(0).WithMessage("Minimum cost cannot be negative.");

        RuleFor(x => x.MaxCost)
            .GreaterThanOrEqualTo(0).WithMessage("Maximum cost cannot be negative.")
            .GreaterThanOrEqualTo(x => x.MinCost)
                .WithMessage("Maximum cost must be greater than or equal to minimum cost.");

        RuleFor(x => x.LastCost)
            .GreaterThanOrEqualTo(x => x.MinCost)
                .WithMessage("Last cost cannot be less than minimum cost.")
            .LessThanOrEqualTo(x => x.MaxCost)
                .WithMessage("Last cost cannot be greater than maximum cost.");

        RuleFor(x => x.RemainingWeightGrams)
            .GreaterThanOrEqualTo(0).WithMessage("Remaining weight cannot be negative.")
            .When(x => x.RemainingWeightGrams.HasValue);

        RuleFor(x => x.BuyLink)
            .MaximumLength(500).WithMessage("Buy link must not exceed 500 characters.")
            .When(x => !string.IsNullOrEmpty(x.BuyLink));
    }
}