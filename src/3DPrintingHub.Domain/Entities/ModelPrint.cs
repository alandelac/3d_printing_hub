namespace _3DPrintingHub.Domain.Entities;

public class ModelPrint
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public string? Category { get; set; }
    public int EstimatedWeightGrams { get; set; }
    public int EstimatedTimeMinutes { get; set; }

    // Requisitos específicos de la pieza
    public bool RequiresIroning { get; set; }
    public bool RequiresSupports { get; set; }

    public decimal DefaultSalePrice { get; set; } // Si lo vendes en e-commerce
    public string? FileLocationOrUrl { get; set; } // Link a repositorio/drive/slicer
    public string? Notes { get; set; }
}