namespace _3DPrintingHub.Application.Dtos;

public class FilamentProfileCreateDto
{
    public Guid MaterialTypeId { get; set; }
    public Guid BrandId { get; set; }

    public decimal? IroningFlowPercentage { get; set; }
    public decimal? IroningSpeedMmS { get; set; }
    public int? SlopeAngleForSupports { get; set; }
    public decimal? ZSeparationForSupports { get; set; }
}
