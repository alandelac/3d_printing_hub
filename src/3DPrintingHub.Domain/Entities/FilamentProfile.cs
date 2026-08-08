namespace _3DPrintingHub.Domain.Entities;

public class FilamentProfile
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid BrandId { get; set; }
    public Brand? BrandName { get; set; }
    public Guid MaterialTypeId { get; set; }
    public MaterialType? MaterialType { get; set; }  // ej. PETG, PLASilkPlus

    // Parámetros de Planchado (Ironing)
    public decimal? IroningFlowPercentage { get; set; } // ej. 10%
    public decimal? IroningSpeedMmS { get; set; }        // ej. 30 mm/s

    // Parámetros de Soportes
    public int? SlopeAngleForSupports { get; set; } // ej. 45 grados
    public decimal? ZSeparationForSupports { get; set; } // ej. 0.2 mm

    // Relación de navegación: Un perfil tiene muchos rollos/carretes físicos
    public ICollection<Filament> Filaments { get; set; } = [];
}