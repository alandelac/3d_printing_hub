namespace _3DPrintingHub.Application.Dtos;

public class ModelPrintDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public Guid CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public int EstimatedWeightGrams { get; set; }
    public int EstimatedTimeMinutes { get; set; }
    public bool CommercialLicense { get; set; }
    public decimal DefaultSalePrice { get; set; }
    public decimal DefaultCost { get; set; }
    public string? FileLocationOrUrl { get; set; }
    public string? Notes { get; set; }
}
