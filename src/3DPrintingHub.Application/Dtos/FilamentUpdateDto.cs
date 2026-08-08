namespace _3DPrintingHub.Application.Dtos;

public class FilamentUpdateDto
{
    /// <summary>
    /// Required: The Id of the Filament to update.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Optional: Remaining weight of the filament in grams.
    /// </summary>
    public int? RemainingWeightGrams { get; set; }

    /// <summary>
    /// Optional: Minimum cost paid for this filament spool.
    /// </summary>
    public decimal? MinCost { get; set; }

    /// <summary>
    /// Optional: Maximum cost paid for this filament spool.
    /// </summary>
    public decimal? MaxCost { get; set; }

    /// <summary>
    /// Optional: The last/actual cost paid for this filament spool.
    /// </summary>
    public decimal? LastCost { get; set; }

    /// <summary>
    /// Optional: Date when this filament was last purchased.
    /// </summary>
    public DateTime? LastPurchaseDate { get; set; }

    /// <summary>
    /// Optional: Link to where this filament was purchased.
    /// </summary>
    public string? BuyLink { get; set; }

    /// <summary>
    /// Optional: Whether this filament should be purchased again.
    /// </summary>
    public bool? BuyAgain { get; set; }
}
