using _3DPrintingHub.Application.Dtos;

namespace _3DPrintingHub.Application.Services;

public interface IModelPrintService
{
    /// <summary>
    /// Creates a new ModelPrint record, calculating DefaultCost and DefaultSalePrice on the backend.
    /// </summary>
    Task<ModelPrintDto> CreateModelPrintAsync(ModelPrintCreateDto dto, CancellationToken cancellationToken = default);

    /// <summary>
    /// Retrieves all ModelPrint records with their category names.
    /// </summary>
    Task<IEnumerable<ModelPrintDto>> GetAllModelPrintsAsync(CancellationToken cancellationToken = default);
}
