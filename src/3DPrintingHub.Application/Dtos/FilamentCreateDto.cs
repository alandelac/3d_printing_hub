namespace _3DPrintingHub.Application.Dtos;

public class FilamentCreateDto
{
    // Reference to the technical profile
    public Guid FilamentProfileId { get; set; }

    // Visual / inventory
    public string Color { get; set; } = string.Empty;
    public int TotalWeightGrams { get; set; } = 1000;
    public int RemainingWeightGrams { get; set; } = 1000;
    public int SpoolEmptyWeightGrams { get; set; }

    // Costs
    public decimal MinCost { get; set; }
    public decimal MaxCost { get; set; }
    public decimal LastCost { get; set; }

    // Optional overrides
    public int? CustomNozzleTemp { get; set; }
}
