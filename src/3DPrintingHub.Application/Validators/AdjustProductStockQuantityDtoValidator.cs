using _3DPrintingHub.Application.Dtos;
using FluentValidation;

namespace _3DPrintingHub.Application.Validators
{
    public class AdjustProductStockQuantityDtoValidator : AbstractValidator<AdjustProductStockQuantityDto>
    {
        public AdjustProductStockQuantityDtoValidator()
        {
            RuleFor(x => x.ProductStockId)
                .NotEmpty().WithMessage("Product stock id is required.");

            RuleFor(x => x.Quantity)
                .NotEqual(0).WithMessage("Quantity must be a non-zero whole number.");
        }
    }
}
