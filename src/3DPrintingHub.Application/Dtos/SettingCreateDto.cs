namespace _3DPrintingHub.Application.Dtos;

public class SettingCreateDto
{
    /// <summary>
    /// The parameter name/key for the setting.
    /// </summary>
    public string Parameter { get; set; } = string.Empty;

    /// <summary>
    /// The numeric value for the setting.
    /// </summary>
    public decimal Value { get; set; }
}
