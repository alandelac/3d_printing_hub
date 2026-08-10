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
}
