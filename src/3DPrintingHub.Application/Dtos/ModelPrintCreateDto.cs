namespace _3DPrintingHub.Application.Dtos;

public class ModelPrintCreateDto
{
    /// <summary>
    /// Required: The name of the model print.
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// Required: The category ID this model print belongs to.
    /// </summary>
    public Guid CategoryId { get; set; }

    /// <summary>
    /// Required: Estimated weight of the print in grams.
    /// </summary>
    public int EstimatedWeightGrams { get; set; }

    /// <summary>
    /// Required: Estimated print time in minutes.
    /// </summary>
    public int EstimatedTimeMinutes { get; set; }

    /// <summary>
    /// Optional: File location or URL for the model file.
    /// </summary>
    public string? FileLocationOrUrl { get; set; }

    /// <summary>
    /// Optional: Additional notes about the model print.
    /// </summary>
    public string? Notes { get; set; }
}
