namespace _3DPrintingHub.Application.Dtos;

public class PrintJobCreateDto
{
    public Guid ModelPrintId { get; set; }
    public Guid FilamentId { get; set; }
    public int ProducedQuantity { get; set; }
    public decimal UsedWeightGrams { get; set; }
    public DateTime PrintedAt { get; set; } = DateTime.UtcNow;
    public string? Notes { get; set; }
}
