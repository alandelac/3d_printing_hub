using System.Threading;
using System.Threading.Tasks;
using _3DPrintingHub.Application.Dtos;

namespace _3DPrintingHub.Application.Services;

public interface IFilamentColorService
{
    /// <summary>
    /// Creates a new FilamentColor record and returns its Id.
    /// </summary>
    Task<Guid> CreateFilamentColorAsync(FilamentColorCreateDto dto, CancellationToken cancellationToken = default);

    
    /// <summary>
    /// Retrieves all FilamentColor records.
    /// </summary>
    Task<IEnumerable<FilamentColorDto>> GetAllFilamentColorsAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates an existing FilamentColor record and returns its Id.
    /// </summary>
    Task<Guid> UpdateFilamentColorAsync(FilamentColorUpdateDto dto, CancellationToken cancellationToken = default);

    /// <summary>
    /// Deletes a FilamentColor record by its Id.
    /// </summary>
    Task DeleteFilamentColorAsync(Guid id, CancellationToken cancellationToken = default);
}
