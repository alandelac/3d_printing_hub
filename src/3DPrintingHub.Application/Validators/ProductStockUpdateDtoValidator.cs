using _3DPrintingHub.Application.Dtos;
using FluentValidation;

namespace _3DPrintingHub.Application.Validators;

public class ProductStockUpdateDtoValidator : AbstractValidator<ProductStockUpdateDto>
{
    public ProductStockUpdateDtoValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Product stock id is required.");

        RuleFor(x => x.Version)
            .GreaterThanOrEqualTo(0).WithMessage("Version cannot be negative.");

        RuleFor(x => x.QuantityInStock)
            .GreaterThanOrEqualTo(0).When(x => x.QuantityInStock.HasValue)
            .WithMessage("Quantity in stock cannot be negative.")
            .LessThanOrEqualTo(int.MaxValue / 2).When(x => x.QuantityInStock.HasValue)
            .WithMessage("Quantity in stock is too large.");

        RuleFor(x => x.SalePrice)
            .GreaterThanOrEqualTo(0).When(x => x.SalePrice.HasValue)
            .WithMessage("Sale price cannot be negative.");
    }
}