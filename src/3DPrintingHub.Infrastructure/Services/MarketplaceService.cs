using System.Linq;
using _3DPrintingHub.Application.Dtos;
using _3DPrintingHub.Application.Services;
using _3DPrintingHub.Domain.Entities;
using _3DPrintingHub.Infrastructure.Data;

namespace _3DPrintingHub.Infrastructure.Services;

public class MarketplaceService(ApplicationDbContext dbContext) : IMarketplaceService
{
    public Task<Guid> CreateMarketplaceAsync(MarketplaceCreateDto dto, CancellationToken cancellationToken = default)
    {
        Marketplace marketplace = new()
        {
            Name = dto.Name
        };

        var existingMarketplace = dbContext.Marketplaces.FirstOrDefault(m => m.Name == marketplace.Name);
        if (existingMarketplace != null)
        {
            throw new InvalidOperationException("A marketplace with the same name already exists.");
        }

        dbContext.Marketplaces.Add(marketplace);
        dbContext.SaveChanges();

        return Task.FromResult(marketplace.Id);
    }

    public Task<IEnumerable<MarketplaceDto>> GetAllMarketplacesAsync(CancellationToken cancellationToken = default)
    {
        var marketplaces = dbContext.Marketplaces
            .Select(m => new MarketplaceDto
            {
                Id = m.Id,
                Name = m.Name
            })
            .OrderBy(m => m.Name)
            .ToList();

        return Task.FromResult<IEnumerable<MarketplaceDto>>(marketplaces);
    }
}
