namespace _3DPrintingHub.Application.Dtos;

public class FilamentProfileDto
{
    public Guid Id { get; set; }
    public Guid BrandId { get; set; }
    public string BrandName { get; set; } = string.Empty;
    public Guid MaterialTypeId { get; set; }
    public string MaterialTypeName { get; set; } = string.Empty;
    public decimal? IroningFlowPercentage { get; set; }
    public decimal? IroningSpeedMmS { get; set; }
    public int? SlopeAngleForSupports { get; set; }
    public decimal? ZSeparationForSupports { get; set; }
}
