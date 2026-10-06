namespace _3DPrintingHub.Application.Dtos;

public class PrintJobDto
{
    public Guid Id { get; set; }
    public Guid ModelPrintId { get; set; }
    public string? ModelPrintName { get; set; }
    public Guid FilamentId { get; set; }
    public string? FilamentName { get; set; }
    public int ProducedQuantity { get; set; }
    public decimal UsedWeightGrams { get; set; }
    public DateTime PrintedAt { get; set; }
    public decimal CalculatedMaterialCost { get; set; }
    public string? Notes { get; set; }
}
