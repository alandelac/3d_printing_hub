namespace _3DPrintingHub.Domain.Entities;

public class Filament
{
    public Guid Id { get; set; } = Guid.NewGuid();

    // Clave Foránea hacia el Perfil Técnico
    public Guid FilamentProfileId { get; set; }
    public FilamentProfile? Profile { get; set; }

    // Datos Propios de este Rollo Específico
    public string Color { get; set; } = string.Empty;

    // Inventario y Pesaje
    public int TotalWeightGrams { get; set; } = 1000;
    public int RemainingWeightGrams { get; set; } = 1000;
    public int SpoolEmptyWeightGrams { get; set; } // Tarado del carrete plástico vacío
    public decimal minCost { get; set; }                   // Precio pagado por este paquete
    public decimal maxCost { get; set; }
    public decimal lastCost { get; set; }


    // Opcional: Permite sobrescribir la temperatura si un color específico (ej. Blanco o Seda) requiere ajustes
    public int? CustomNozzleTemp { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Propiedad calculada
    public decimal CostPerGram => TotalWeightGrams > 0 ? lastCost / TotalWeightGrams : 0m;
}