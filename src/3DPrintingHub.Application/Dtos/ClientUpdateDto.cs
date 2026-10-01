using _3DPrintingHub.Domain.Entities;

namespace _3DPrintingHub.Application.Dtos;

public class ClientUpdateDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public ClientContactPlatform ContactPlatform { get; set; }
    public string? Phone { get; set; }
    public string? Email { get; set; }
}
