namespace _3DPrintingHub.Domain.Entities;

public class Filament
{
    public Guid Id { get; set; } = Guid.NewGuid();

    // Clave Foránea hacia el Perfil Técnico
    public Guid FilamentProfileId { get; set; }
    public FilamentProfile Profile { get; set; } = new FilamentProfile();
    public Guid FilamentColorId { get; set; }
    public FilamentColor Color { get; set; } = new FilamentColor();

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
}