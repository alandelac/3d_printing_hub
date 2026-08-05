namespace _3DPrintingHub.Domain.Entities;

public class Marketplace
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;

    public ICollection<PublishedModels> PublishedModels { get; set; } = [];
}