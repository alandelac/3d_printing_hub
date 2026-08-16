using System.Threading;
using System.Threading.Tasks;
using _3DPrintingHub.Application.Dtos;

namespace _3DPrintingHub.Application.Services;

public interface IFilamentProfileService
{
    /// <summary>
    /// Creates a new FilamentProfile record and returns its Id.
    /// </summary>
    Task<Guid> CreateFilamentProfileAsync(FilamentProfileCreateDto dto, CancellationToken cancellationToken = default);

    /// <summary>
    /// Retrieves all FilamentProfile records.
    /// </summary>
    Task<IEnumerable<FilamentProfileDto>> GetAllFilamentProfilesAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates an existing FilamentProfile record and returns its Id.
    /// </summary>
    Task<Guid> UpdateFilamentProfileAsync(FilamentProfileUpdateDto dto, CancellationToken cancellationToken = default);

    /// <summary>
    /// Deletes a FilamentProfile record by its Id.
    /// </summary>
    Task DeleteFilamentProfileAsync(Guid id, CancellationToken cancellationToken = default);
}
