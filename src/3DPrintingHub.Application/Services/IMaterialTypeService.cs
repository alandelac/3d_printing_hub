using System.Threading;
using System.Threading.Tasks;
using _3DPrintingHub.Application.Dtos;

namespace _3DPrintingHub.Application.Services;

public interface IMaterialTypeService
{
    /// <summary>
    /// Creates a new MaterialType record and returns its Id.
    /// </summary>
    Task<Guid> CreateMaterialTypeAsync(MaterialTypeCreateDto dto, CancellationToken cancellationToken = default);

    
    /// <summary>
    /// Retrieves all MaterialType records.
    /// </summary>
    Task<IEnumerable<MaterialTypeDto>> GetAllMaterialTypesAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates an existing MaterialType record and returns its Id.
    /// </summary>
    Task<Guid> UpdateMaterialTypeAsync(MaterialTypeUpdateDto dto, CancellationToken cancellationToken = default);

    /// <summary>
    /// Deletes a MaterialType record by its Id.
    /// </summary>
    Task DeleteMaterialTypeAsync(Guid id, CancellationToken cancellationToken = default);
}
