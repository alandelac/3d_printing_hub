using _3DPrintingHub.Application.Dtos;
using FluentValidation;

namespace _3DPrintingHub.Application.Validators;

public class FilamentCreateDtoValidator : AbstractValidator<FilamentCreateDto>
{
    public FilamentCreateDtoValidator()
    {
        RuleFor(x => x.FilamentProfileId)
            .NotEmpty().WithMessage("Filament profile is required.");

        RuleFor(x => x.Color)
            .NotEmpty().WithMessage("Color is required.")
            .MaximumLength(50).WithMessage("Color must not exceed 50 characters.");

        RuleFor(x => x.TotalWeightGrams)
            .GreaterThan(0).WithMessage("Total weight must be greater than 0.")
            .LessThanOrEqualTo(5000).WithMessage("Total weight must not exceed 5000 grams.");

        RuleFor(x => x.RemainingWeightGrams)
            .GreaterThanOrEqualTo(0).WithMessage("Remaining weight cannot be negative.")
            .LessThanOrEqualTo(x => x.TotalWeightGrams)
                .WithMessage("Remaining weight cannot exceed total weight.");

        RuleFor(x => x.SpoolEmptyWeightGrams)
            .GreaterThanOrEqualTo(0).WithMessage("Spool empty weight cannot be negative.")
            .LessThan(x => x.TotalWeightGrams)
                .WithMessage("Spool empty weight must be less than total weight.");

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

        RuleFor(x => x.CustomNozzleTemp)
            .InclusiveBetween(150, 500).WithMessage("Custom nozzle temperature must be between 150 and 500 °C.")
            .When(x => x.CustomNozzleTemp.HasValue);
    }
}