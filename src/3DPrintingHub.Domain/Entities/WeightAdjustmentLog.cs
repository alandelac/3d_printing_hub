namespace _3DPrintingHub.Domain.Entities;

public class WeightAdjustmentLog
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid FilamentId { get; set; }
    public Filament Filament { get; set; } = null!;
    public DateTime TimestampUtc { get; set; } = DateTime.UtcNow;
    public string UserId { get; set; } = "system";
    public string Reason { get; set; } = string.Empty;
    public int OldWeightGrams { get; set; }
    public int NewWeightGrams { get; set; }
}
