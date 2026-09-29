namespace _3DPrintingHub.Application.Dtos;

/// <summary>
/// DTO for adjusting the remaining weight of a Filament.
/// Positive values add to the stock, negative values reduce it.
/// </summary>
public class AdjustFilamentWeightDto
{
    /// <summary>
    /// The Id of the Filament to adjust.
    /// </summary>
    public Guid FilamentId { get; set; }

    /// <summary>
    /// The amount of grams to add or subtract.
    /// </summary>
    public decimal Amount { get; set; }

    /// <summary>
    /// Backward compatible alias for older clients.
    /// </summary>
    public int Grams
    {
        get => (int)Math.Round(Amount, MidpointRounding.AwayFromZero);
        set => Amount = value;
    }

    /// <summary>
    /// The business reason for the adjustment.
    /// </summary>
    public string? Reason { get; set; }
}
