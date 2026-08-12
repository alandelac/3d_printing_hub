namespace _3DPrintingHub.Application.Dtos;

public class ModelPrintUpdateDto
{
    /// <summary>
    /// Required: The Id of the ModelPrint to update.
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// Optional: The name of the model print.
    /// </summary>
    public string? Name { get; set; }

    /// <summary>
    /// Optional: The category ID this model print belongs to.
    /// </summary>
    public Guid? CategoryId { get; set; }

    /// <summary>
    /// Optional: Estimated weight of the print in grams.
    /// When provided together with EstimatedTimeMinutes, DefaultCost and DefaultSalePrice are recalculated.
    /// </summary>
    public int? EstimatedWeightGrams { get; set; }

    /// <summary>
    /// Optional: Estimated print time in minutes.
    /// When provided together with EstimatedWeightGrams, DefaultCost and DefaultSalePrice are recalculated.
    /// </summary>
    public int? EstimatedTimeMinutes { get; set; }

    /// <summary>
    /// Optional: File location or URL for the model file.
    /// </summary>
    public string? FileLocationOrUrl { get; set; }

    /// <summary>
    /// Optional: Additional notes about the model print.
    /// </summary>
    public string? Notes { get; set; }
}