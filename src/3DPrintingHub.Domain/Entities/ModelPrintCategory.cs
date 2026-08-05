namespace _3DPrintingHub.Domain.Entities;

public class ModelPrintCategory
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;

    public ICollection<ModelPrint> ModelPrints { get; set; } = [];
}