namespace _3DPrintingHub.Domain.Entities;

public class FilamentColor
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public string Name { get; set; } = string.Empty;
    public string ColorCode { get; set; } = string.Empty; // Default to white

    public ICollection<Filament> Filaments { get; set; } = [];

}