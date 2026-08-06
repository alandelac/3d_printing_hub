using System.Threading;
using System.Threading.Tasks;
using _3DPrintingHub.Application.Dtos;

namespace _3DPrintingHub.Application.Services;

public interface IMarketplaceService
{
    /// <summary>
    /// Creates a new Marketplace record and returns its Id.
    /// </summary>
    Task<Guid> CreateMarketplaceAsync(MarketplaceCreateDto dto, CancellationToken cancellationToken = default);

    /// <summary>
    /// Retrieves all Marketplace records.
    /// </summary>
    Task<IEnumerable<MarketplaceDto>> GetAllMarketplacesAsync(CancellationToken cancellationToken = default);
}
