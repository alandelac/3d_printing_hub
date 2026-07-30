using _3DPrintingHub.Domain.Enums;

namespace _3DPrintingHub.Domain.Entities;

public class PrintJob
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public Guid FilamentId { get; set; }
    public Filament? Filament { get; set; }

    public Guid ModelPrintId { get; set; }
    public ModelPrint? ModelPrint { get; set; }

    public decimal UsedWeightGrams { get; set; }
    public PrintStatus Status { get; set; } = PrintStatus.Success;
    public DateTime PrintedAt { get; set; } = DateTime.UtcNow;

    // Cálculo automático del costo del material usado
    public decimal CalculatedMaterialCost { get; set; }
    public string? Notes { get; set; }
}