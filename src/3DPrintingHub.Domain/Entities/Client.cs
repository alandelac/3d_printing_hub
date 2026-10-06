namespace _3DPrintingHub.Domain.Entities;

public enum ClientContactPlatform
{
    WhatsApp,
    Facebook,
    PhoneCall
}

public class Client
{
    public Guid Id { get; set; } = Guid.NewGuid();

    public string Name { get; set; } = string.Empty;

    public ClientContactPlatform ContactPlatform { get; set; }

    public bool IsArchived { get; set; }

    public string? Phone { get; set; }

    public string? Email { get; set; }

    public ICollection<Sale> Sales { get; set; } = [];
}
