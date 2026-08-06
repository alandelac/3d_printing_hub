using System.Linq;
using _3DPrintingHub.Application.Dtos;
using _3DPrintingHub.Application.Services;
using _3DPrintingHub.Domain.Entities;
using _3DPrintingHub.Infrastructure.Data;

namespace _3DPrintingHub.Infrastructure.Services;

public class MarketplaceService : IMarketplaceService
{
    private readonly ApplicationDbContext _dbContext;

    public MarketplaceService(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public Task<Guid> CreateMarketplaceAsync(MarketplaceCreateDto dto, CancellationToken cancellationToken = default)
    {
        Marketplace marketplace = new()
        {
            Name = dto.Name
        };

        var existingMarketplace = _dbContext.Marketplaces.FirstOrDefault(m => m.Name == marketplace.Name);
        if (existingMarketplace != null)
        {
            throw new InvalidOperationException("A marketplace with the same name already exists.");
        }

        _dbContext.Marketplaces.Add(marketplace);
        _dbContext.SaveChanges();

        return Task.FromResult(marketplace.Id);
    }

    public Task<IEnumerable<MarketplaceDto>> GetAllMarketplacesAsync(CancellationToken cancellationToken = default)
    {
        var marketplaces = _dbContext.Marketplaces
            .Select(m => new MarketplaceDto
            {
                Id = m.Id,
                Name = m.Name
            })
            .ToList();

        return Task.FromResult<IEnumerable<MarketplaceDto>>(marketplaces);
    }
}
