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
}
