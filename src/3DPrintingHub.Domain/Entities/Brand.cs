namespace _3DPrintingHub.Domain.Entities;

public class Brand
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public string Name { get; set; } = string.Empty;
}