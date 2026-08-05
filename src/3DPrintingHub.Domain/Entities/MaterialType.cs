namespace _3DPrintingHub.Domain.Entities;

public class MaterialType
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public string Name { get; set; } = string.Empty;
}