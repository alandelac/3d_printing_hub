namespace _3DPrintingHub.Application.Dtos;

public class FilamentDto
{
    public Guid Id { get; set; }

    /// <summary>
    /// Foreign key to the technical print profile.
    /// </summary>
    public Guid FilamentProfileId { get; set; }

    /// <summary>
    /// The full filament profile object (brand, material type, print settings).
    /// </summary>
    public FilamentProfileDto FilamentProfile { get; set; } = new();

    /// <summary>
    /// Foreign key to the filament color.
    /// </summary>
    public Guid FilamentColorId { get; set; }

    /// <summary>
    /// The display name of the color (e.g. "Red", "White").
    /// </summary>
    public string ColorName { get; set; } = string.Empty;

    /// <summary>
    /// Color hex code for UI rendering.
    /// </summary>
    public string ColorCode { get; set; } = string.Empty;

    /// <summary>
    /// Remaining filament weight in grams.
    /// </summary>
    public int RemainingWeightGrams { get; set; }

    public decimal MinCost { get; set; }
    public decimal MaxCost { get; set; }
    public decimal LastCost { get; set; }

    public DateTime LastPurchaseDate { get; set; }
    public string? BuyLink { get; set; }
    public bool? BuyAgain { get; set; }
}
