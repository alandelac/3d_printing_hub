using _3DPrintingHub.Application.Dtos;
using FluentValidation;

namespace _3DPrintingHub.Application.Validators;

public class MarketplaceCreateDtoValidator : AbstractValidator<MarketplaceCreateDto>
{
    public MarketplaceCreateDtoValidator()
    {
        RuleFor(x => x.Name)
            .NotEmpty().WithMessage("Marketplace name is required.")
            .MaximumLength(100).WithMessage("Marketplace name must not exceed 100 characters.");
    }
}
