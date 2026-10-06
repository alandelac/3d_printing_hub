using _3DPrintingHub.Application.Dtos;
using FluentValidation;

namespace _3DPrintingHub.Application.Validators;

public class SettingCreateDtoValidator : AbstractValidator<SettingCreateDto>
{
    public SettingCreateDtoValidator()
    {
        When(dto => string.Equals(dto.Parameter, "minimum_inventory_quantity", StringComparison.OrdinalIgnoreCase), () =>
        {
            RuleFor(dto => dto.Value)
                .Must(value => value >= 0 && value <= int.MaxValue && decimal.Truncate(value) == value)
                .WithMessage("Minimum inventory quantity must be a non-negative integer.");
        });
    }
}