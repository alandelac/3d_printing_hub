namespace _3DPrintingHub.Application.Dtos;

public class FilamentCreateDto
{
    /// <summary>
    /// Required: The technical profile that defines print settings for this filament.
    /// </summary>
    public Guid FilamentProfileId { get; set; }

    /// <summary>
    /// Required: The color of this filament spool.
    /// </summary>
    public Guid FilamentColorId { get; set; }

    /// <summary>
    /// Required: Minimum cost paid for this filament spool.
    /// </summary>
    public decimal MinCost { get; set; }

    /// <summary>
    /// Required: Maximum cost paid for this filament spool.
    /// </summary>
    public decimal MaxCost { get; set; }

    /// <summary>
    /// Required: The last/actual cost paid for this filament spool.
    /// </summary>
    public decimal LastCost { get; set; }

    /// <summary>
    /// Optional: Whether this filament should be purchased again.
    /// </summary>
    public bool? BuyAgain { get; set; }

    /// <summary>
    /// Optional: Link to where this filament was purchased.
    /// </summary>
    public string? BuyLink { get; set; }

    /// <summary>
    /// Optional: Date when this filament was last purchased.
    /// </summary>
    public DateTime? LastPurchaseDate { get; set; }

    /// <summary>
    /// Optional: Remaining weight of the filament in grams.
    /// </summary>
    public int? RemainingWeightGrams { get; set; }
}
