using _3DPrintingHub.Application.Dtos;
using FluentValidation;

namespace _3DPrintingHub.Application.Validators;

public class MaterialTypeCreateDtoValidator : AbstractValidator<MaterialTypeCreateDto>
{
    public MaterialTypeCreateDtoValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Material type name is required.")
            .MinimumLength(2).WithMessage("Material type name must have at least 2 characters.")
            .MaximumLength(100).WithMessage("Material type name must not exceed 100 characters.");
    }
}