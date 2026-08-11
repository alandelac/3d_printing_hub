using _3DPrintingHub.Application.Dtos;
using FluentValidation;

namespace _3DPrintingHub.Application.Validators;

public class ModelPrintCreateDtoValidator : AbstractValidator<ModelPrintCreateDto>
{
    public ModelPrintCreateDtoValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Name is required.")
            .MaximumLength(100).WithMessage("Name must not exceed 100 characters.");

        RuleFor(x => x.CategoryId)
            .NotEmpty().WithMessage("Category ID is required.");

        RuleFor(x => x.EstimatedWeightGrams)
            .GreaterThan(0).WithMessage("Estimated weight must be greater than 0 grams.");

        RuleFor(x => x.EstimatedTimeMinutes)
            .GreaterThan(0).WithMessage("Estimated time must be greater than 0 minutes.");

        RuleFor(x => x.FileLocationOrUrl)
            .MaximumLength(500).WithMessage("File location or URL must not exceed 500 characters.")
            .When(x => !string.IsNullOrEmpty(x.FileLocationOrUrl));

        RuleFor(x => x.Notes)
            .MaximumLength(1000).WithMessage("Notes must not exceed 1000 characters.")
            .When(x => !string.IsNullOrEmpty(x.Notes));
    }
}
