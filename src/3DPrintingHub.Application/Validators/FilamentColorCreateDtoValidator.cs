using System.Text.RegularExpressions;
using _3DPrintingHub.Application.Dtos;
using FluentValidation;

namespace _3DPrintingHub.Application.Validators;

public partial class FilamentColorCreateDtoValidator : AbstractValidator<FilamentColorCreateDto>
{
    public FilamentColorCreateDtoValidator()
    {
        RuleFor(x => x.Color)
            .NotEmpty().WithMessage("Color name is required.")
            .MinimumLength(2).WithMessage("Color name must have at least 2 characters.")
            .MaximumLength(50).WithMessage("Color name must not exceed 50 characters.");

        RuleFor(x => x.ColorCode)
            .NotEmpty().WithMessage("Color code is required.")
            .Matches(HexColorRegex()).WithMessage("Color code must be a valid hex color (e.g., #FFFFFF or #FFFFFFFF).");
    }

    [GeneratedRegex("^#([0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$")]
    private static partial Regex HexColorRegex();
}