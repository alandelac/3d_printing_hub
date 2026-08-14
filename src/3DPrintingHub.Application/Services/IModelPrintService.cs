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

    /// <summary>
    /// Deletes a ModelPrint record by its Id and returns the deleted ModelPrint data.
    /// </summary>
    Task<ModelPrintDto> DeleteModelPrintAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates a ModelPrint record by its Id with the provided fields and returns the updated ModelPrint data.
    /// DefaultCost and DefaultSalePrice are recalculated when EstimatedWeightGrams or EstimatedTimeMinutes are provided.
    /// </summary>
    Task<ModelPrintDto> UpdateModelPrintAsync(ModelPrintUpdateDto dto, CancellationToken cancellationToken = default);

    /// <summary>
    /// Recomputes DefaultCost and DefaultSalePrice for every ModelPrint using the current
    /// average filament price and the configured cost settings. Returns the number of ModelPrints that were updated.
    /// </summary>
    Task<int> RecalculateAllModelPrintCostsAsync(CancellationToken cancellationToken = default);
}