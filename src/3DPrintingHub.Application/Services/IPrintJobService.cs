using _3DPrintingHub.Application.Dtos;

namespace _3DPrintingHub.Application.Services;

public interface IPrintJobService
{
    Task<Guid> CreatePrintJobAsync(PrintJobCreateDto dto, CancellationToken cancellationToken = default);

    Task<IEnumerable<PrintJobDto>> GetPrintJobsAsync(CancellationToken cancellationToken = default);

    Task<PrintJobDto> GetPrintJobByIdAsync(Guid id, CancellationToken cancellationToken = default);
}
