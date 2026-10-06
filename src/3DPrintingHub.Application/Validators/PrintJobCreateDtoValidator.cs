using _3DPrintingHub.Application.Dtos;
using FluentValidation;

namespace _3DPrintingHub.Application.Validators;

public class PrintJobCreateDtoValidator : AbstractValidator<PrintJobCreateDto>
{
    public PrintJobCreateDtoValidator()
    {
        RuleFor(x => x.ModelPrintId)
            .NotEmpty().WithMessage("ModelPrintId is required.");

        RuleFor(x => x.FilamentId)
            .NotEmpty().WithMessage("FilamentId is required.");

        RuleFor(x => x.ProducedQuantity)
            .GreaterThan(0).WithMessage("Produced quantity must be greater than zero.");

        RuleFor(x => x.UsedWeightGrams)
            .GreaterThan(0).WithMessage("Used weight must be greater than zero.");
    }
}
