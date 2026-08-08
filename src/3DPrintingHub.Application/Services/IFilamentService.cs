using System.Threading;
using System.Threading.Tasks;
using _3DPrintingHub.Application.Dtos;

namespace _3DPrintingHub.Application.Services;

public interface IFilamentService
{
    /// <summary>
    /// Creates a new Filament record and returns its Id.
    /// </summary>
    Task<Guid> CreateFilamentAsync(FilamentCreateDto dto, CancellationToken cancellationToken = default);

    /// <summary>
    /// Retrieves all Filament records with their profile and color information.
    /// </summary>
    Task<IEnumerable<FilamentDto>> GetAllFilamentsAsync(CancellationToken cancellationToken = default);
}
