namespace _3DPrintingHub.Application.Dtos;

/// <summary>
/// DTO for adjusting the remaining weight of a Filament.
/// Positive grams add to the stock, negative grams reduce it.
/// </summary>
public class AdjustFilamentWeightDto
{
    /// <summary>
    /// The Id of the Filament to adjust.
    /// </summary>
    public Guid FilamentId { get; set; }

    /// <summary>
    /// The amount of grams to add (positive) or reduce (negative).
    /// Must be a whole number (not decimal).
    /// </summary>
    public int Grams { get; set; }
}
