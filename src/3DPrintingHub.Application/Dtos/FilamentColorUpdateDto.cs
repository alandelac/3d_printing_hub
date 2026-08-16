namespace _3DPrintingHub.Application.Dtos;

public class FilamentColorUpdateDto
{
    public Guid Id { get; set; }
    public string Color { get; set; } = string.Empty;
    public string ColorCode { get; set; } = string.Empty;
}