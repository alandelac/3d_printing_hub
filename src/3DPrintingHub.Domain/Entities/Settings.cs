namespace _3DPrintingHub.Domain.Entities;

public class Settings
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string parameter { get; set; } = string.Empty;
    public decimal value { get; set; }
}