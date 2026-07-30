using _3DPrintingHub.Domain.Enums;

namespace _3DPrintingHub.Domain.Entities;

public class FilamentProfile
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Brand { get; set; } = string.Empty; // ej. Sunlu, eSUN, Bambu
    public MaterialType MaterialType { get; set; }   // ej. PETG, PLASilkPlus
    public MaterialSubType MaterialSubType { get; set; } // ej. PLA, PETG, ABS, ASA, TPU

    // Parámetros de Planchado (Ironing)
    public bool IroningSupported { get; set; } = true;
    public decimal? IroningFlowPercentage { get; set; } // ej. 10%
    public decimal? IroningSpeedMmS { get; set; }        // ej. 30 mm/s

    // Parámetros de Soportes
    public int slopeAngleForSupports { get; set; } // ej. 45 grados
    public decimal zSeparationForSupports { get; set; } // ej. 0.2 mm

    // Relación de navegación: Un perfil tiene muchos rollos/carretes físicos
    public ICollection<Filament> Filaments { get; set; } = new List<Filament>();
}