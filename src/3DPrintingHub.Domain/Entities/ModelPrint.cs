namespace _3DPrintingHub.Domain.Entities;

public class ModelPrint
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public Guid CategoryId { get; set; }
    public ModelPrintCategory Category { get; set; } = new ModelPrintCategory();
    public int EstimatedWeightGrams { get; set; }
    public int EstimatedTimeMinutes { get; set; }


    public bool CommercialLicense { get; set; } // True si se puede vender, false si es solo para uso personal

    public decimal DefaultSalePrice { get; set; } // Si lo vendes en e-commerce
    public decimal DefaultCost { get; set; } // Costo de producción estimado
    public string? FileLocationOrUrl { get; set; } // Link a repositorio/drive/slicer
    public string? Notes { get; set; }

    public ICollection<ProductStock> ProductStocks { get; set; } = [];
}