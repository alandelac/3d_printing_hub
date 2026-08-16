using System.Threading;
using System.Threading.Tasks;
using _3DPrintingHub.Application.Dtos;

namespace _3DPrintingHub.Application.Services;

public interface IModelPrintCategoryService
{
    /// <summary>
    /// Creates a new ModelPrintCategory record and returns its Id.
    /// </summary>
    Task<Guid> CreateModelPrintCategoryAsync(ModelPrintCategoryCreateDto dto, CancellationToken cancellationToken = default);

    /// <summary>
    /// Retrieves all ModelPrintCategory records sorted alphabetically by name.
    /// </summary>
    Task<IEnumerable<ModelPrintCategoryDto>> GetAllModelPrintCategoriesAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates an existing ModelPrintCategory record and returns its Id.
    /// </summary>
    Task<Guid> UpdateModelPrintCategoryAsync(ModelPrintCategoryUpdateDto dto, CancellationToken cancellationToken = default);

    /// <summary>
    /// Deletes a ModelPrintCategory record by its Id.
    /// </summary>
    Task DeleteModelPrintCategoryAsync(Guid id, CancellationToken cancellationToken = default);
}
