using _3DPrintingHub.Application.Dtos;
using FluentValidation;

namespace _3DPrintingHub.Application.Validators
{
    public class ProductStockCreateDtoValidator : AbstractValidator<ProductStockCreateDto>
    {
        public ProductStockCreateDtoValidator()
        {
            RuleFor(x => x.ModelPrintId)
                .NotEmpty().WithMessage("Model print is required.");

            RuleFor(x => x.FilamentId)
                .NotEmpty().WithMessage("Filament is required.");

            RuleFor(x => x.QuantityInStock)
                .GreaterThanOrEqualTo(0).WithMessage("Quantity in stock cannot be negative.");

            RuleFor(x => x.CostToProduce)
                .GreaterThanOrEqualTo(0).WithMessage("Cost to produce cannot be negative.");

            RuleFor(x => x.SalePrice)
                .GreaterThanOrEqualTo(0).WithMessage("Sale price cannot be negative.");
        }
    }
}
