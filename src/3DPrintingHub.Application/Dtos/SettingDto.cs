namespace _3DPrintingHub.Application.Dtos;

public class SettingDto
{
    public Guid Id { get; set; }
    public string Parameter { get; set; } = string.Empty;
    public decimal Value { get; set; }
}
