using System.Threading;
using System.Threading.Tasks;
using _3DPrintingHub.Application.Dtos;

namespace _3DPrintingHub.Application.Services;

public interface IBrandService
{
    /// <summary>
    /// Creates a new Brand record and returns its Id.
    /// </summary>
    Task<Guid> CreateBrandAsync(BrandCreateDto dto, CancellationToken cancellationToken = default);

    
    /// <summary>
    /// Retrieves all Brand records.
    /// </summary>
    Task<IEnumerable<BrandDto>> GetAllBrandsAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates an existing Brand record and returns its Id.
    /// </summary>
    Task<Guid> UpdateBrandAsync(BrandUpdateDto dto, CancellationToken cancellationToken = default);

    /// <summary>
    /// Deletes a Brand record by its Id.
    /// </summary>
    Task DeleteBrandAsync(Guid id, CancellationToken cancellationToken = default);
}
