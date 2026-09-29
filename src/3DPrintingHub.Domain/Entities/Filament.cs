using _3DPrintingHub.Domain.Exceptions;

namespace _3DPrintingHub.Domain.Entities;

public class Filament
{
    public Guid Id { get; set; } = Guid.NewGuid();

    // Clave Foránea hacia el Perfil Técnico
    public Guid FilamentProfileId { get; set; }
    public FilamentProfile? Profile { get; set; }
    public Guid FilamentColorId { get; set; }
    public FilamentColor? Color { get; set; }

    // Inventario y Pesaje
    public int RemainingWeightGrams { get; set; } = 1000;
    public decimal MinCost { get; set; }                   // Precio pagado por este paquete
    public decimal MaxCost { get; set; }
    public decimal LastCost { get; set; }

    public DateTime LastPurchaseDate { get; set; } = DateTime.UtcNow;
    public string? BuyLink { get; set; }
    public bool? BuyAgain { get; set; }

    // Propiedad calculada
    public decimal CostPerGram => MaxCost / 1000; // asumiendo que el peso total es de un Kg

    public ICollection<ProductStock> ProductStocks { get; set; } = [];
    public ICollection<WeightAdjustmentLog> WeightAdjustmentLogs { get; set; } = [];

    public void AdjustRemainingWeight(decimal amount, string reason, string? userId = null)
    {
        if (string.IsNullOrWhiteSpace(reason))
        {
            throw new ArgumentException("A reason is required when adjusting filament weight.", nameof(reason));
        }

        var oldWeight = RemainingWeightGrams;
        var nextWeight = (decimal)RemainingWeightGrams + amount;

        if (nextWeight < 0)
        {
            throw new BusinessRuleException("Remaining weight cannot be negative.");
        }

        RemainingWeightGrams = (int)Math.Round(nextWeight, MidpointRounding.AwayFromZero);
        WeightAdjustmentLogs.Add(new WeightAdjustmentLog
        {
            FilamentId = Id,
            TimestampUtc = DateTime.UtcNow,
            UserId = userId ?? "system",
            Reason = reason,
            OldWeightGrams = oldWeight,
            NewWeightGrams = RemainingWeightGrams
        });
    }
}