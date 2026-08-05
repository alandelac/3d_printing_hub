using System.Threading;
using System.Threading.Tasks;
using _3DPrintingHub.Application.Dtos;
using _3DPrintingHub.Application.Services;
using _3DPrintingHub.Domain.Entities;
using _3DPrintingHub.Infrastructure.Data;

namespace _3DPrintingHub.Infrastructure.Services;

public class FilamentService : IFilamentService
{
    private readonly ApplicationDbContext _dbContext;

    public FilamentService(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<Guid> CreateFilamentAsync(FilamentCreateDto dto, CancellationToken cancellationToken = default)
    {
        var filament = new Filament
        {
           /* FilamentProfileId = dto.FilamentProfileId,
            Color = dto.Color,
            TotalWeightGrams = dto.TotalWeightGrams,
            RemainingWeightGrams = dto.RemainingWeightGrams,
            SpoolEmptyWeightGrams = dto.SpoolEmptyWeightGrams,
            minCost = dto.MinCost,
            maxCost = dto.MaxCost,
            lastCost = dto.LastCost,
            CustomNozzleTemp = dto.CustomNozzleTemp,
            CreatedAt = DateTime.UtcNow
            */
        };

        await _dbContext.Filaments.AddAsync(filament, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);

        return filament.Id;
    }
}
