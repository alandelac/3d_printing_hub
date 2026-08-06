using _3DPrintingHub.Application.Dtos;
using FluentValidation;

namespace _3DPrintingHub.Application.Validators;

public class BrandCreateDtoValidator : AbstractValidator<BrandCreateDto>
{
    public BrandCreateDtoValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Brand name is required.")
            .MaximumLength(100).WithMessage("Brand name must not exceed 100 characters.");
    }
}