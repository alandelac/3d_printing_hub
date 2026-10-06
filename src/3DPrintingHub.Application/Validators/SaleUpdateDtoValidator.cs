using _3DPrintingHub.Application.Dtos;
using FluentValidation;

namespace _3DPrintingHub.Application.Validators;

public class SaleUpdateDtoValidator : AbstractValidator<SaleUpdateDto>
{
    public SaleUpdateDtoValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Sale id is required.");

        RuleFor(x => x.ProductStockId)
            .NotEmpty().WithMessage("ProductStockId is required.");

        RuleFor(x => x.Quantity)
            .GreaterThan(0).WithMessage("Quantity must be greater than zero.");

        RuleFor(x => x.SalePrice)
            .GreaterThan(0).WithMessage("Sale price must be greater than zero.");

        RuleFor(x => x.PaymentReceived)
            .NotNull().WithMessage("PaymentReceived must be explicitly provided.");

        When(x => x.ClientId.HasValue, () =>
        {
            RuleFor(x => x.ClientId)
                .NotEqual(Guid.Empty).WithMessage("ClientId cannot be empty when supplied.");
        });
    }
}
