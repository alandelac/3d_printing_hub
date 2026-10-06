using _3DPrintingHub.Application.Dtos;
using _3DPrintingHub.Application.Exceptions;
using _3DPrintingHub.Application.Services;
using _3DPrintingHub.Domain.Entities;
using _3DPrintingHub.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace _3DPrintingHub.Infrastructure.Services;

public class PrintJobService(ApplicationDbContext dbContext, IPrintPricingService printPricingService) : IPrintJobService
{
    public async Task<Guid> CreatePrintJobAsync(PrintJobCreateDto dto, CancellationToken cancellationToken = default)
    {
        if (dto.ModelPrintId == Guid.Empty)
            throw new BusinessRuleException("ModelPrintId is required.");

        if (dto.FilamentId == Guid.Empty)
            throw new BusinessRuleException("FilamentId is required.");

        if (dto.ProducedQuantity <= 0)
            throw new BusinessRuleException("Produced quantity must be greater than zero.");

        if (dto.UsedWeightGrams <= 0m)
            throw new BusinessRuleException("Used weight must be greater than zero.");

        var modelPrint = await dbContext.ModelPrints
            .AsNoTracking()
            .FirstOrDefaultAsync(mp => mp.Id == dto.ModelPrintId, cancellationToken)
            ?? throw new ResourceNotFoundException($"ModelPrint with ID {dto.ModelPrintId} was not found.");

        var filament = await dbContext.Filaments
            .AsNoTracking()
            .FirstOrDefaultAsync(f => f.Id == dto.FilamentId, cancellationToken)
            ?? throw new ResourceNotFoundException($"Filament with ID {dto.FilamentId} was not found.");

        if (dto.UsedWeightGrams > filament.RemainingWeightGrams)
            throw new BusinessRuleException("Insufficient filament remaining weight to complete the requested print job.");

        var materialCostPerGram = filament.MaxCost / 1000m;
        var materialCost = dto.UsedWeightGrams * materialCostPerGram;
        var gramsToSubtract = (int)Math.Round(dto.UsedWeightGrams, MidpointRounding.AwayFromZero);

        using var transaction = await dbContext.Database.BeginTransactionAsync(cancellationToken);

        var productStock = await dbContext.ProductStocks
            .FirstOrDefaultAsync(ps => ps.ModelPrintId == dto.ModelPrintId && ps.FilamentId == dto.FilamentId, cancellationToken);

        if (productStock is null)
        {
            var costToProduce = await printPricingService.CalculateCostUsingFilamentAsync(
                modelPrint.EstimatedWeightGrams,
                modelPrint.EstimatedTimeMinutes,
                filament.MaxCost,
                cancellationToken);
            var recommendedSalePrice = costToProduce * 2;

            productStock = new ProductStock
            {
                ModelPrintId = dto.ModelPrintId,
                FilamentId = dto.FilamentId,
                QuantityInStock = dto.ProducedQuantity,
                CostToProduce = costToProduce,
                RecommendedSalePrice = recommendedSalePrice,
                SalePrice = recommendedSalePrice,
                Version = 0,
                LastUpdated = DateTime.UtcNow
            };
            await dbContext.ProductStocks.AddAsync(productStock, cancellationToken);
        }
        else
        {
            var stockRowsAffected = await dbContext.ProductStocks
                .Where(ps => ps.Id == productStock.Id && ps.Version == productStock.Version)
                .ExecuteUpdateAsync(setters => setters
                    .SetProperty(ps => ps.QuantityInStock, ps => ps.QuantityInStock + dto.ProducedQuantity)
                    .SetProperty(ps => ps.Version, ps => ps.Version + 1)
                    .SetProperty(ps => ps.LastUpdated, DateTime.UtcNow), cancellationToken);

            if (stockRowsAffected == 0)
                throw new ResourceConflictException("The selected stock row was changed by another request.");
        }

        var filamentRowsAffected = await dbContext.Filaments
            .Where(f => f.Id == filament.Id && f.RemainingWeightGrams >= gramsToSubtract)
            .ExecuteUpdateAsync(setters => setters
                .SetProperty(f => f.RemainingWeightGrams, f => f.RemainingWeightGrams - gramsToSubtract)
                .SetProperty(f => f.LastPurchaseDate, DateTime.UtcNow), cancellationToken);

        if (filamentRowsAffected == 0)
            throw new BusinessRuleException("Insufficient filament remaining weight to complete the requested print job.");

        var printJob = new PrintJob
        {
            ModelPrintId = dto.ModelPrintId,
            FilamentId = dto.FilamentId,
            ProducedQuantity = dto.ProducedQuantity,
            UsedWeightGrams = dto.UsedWeightGrams,
            PrintedAt = dto.PrintedAt == default ? DateTime.UtcNow : dto.PrintedAt,
            CalculatedMaterialCost = materialCost,
            Notes = dto.Notes
        };

        await dbContext.PrintJobs.AddAsync(printJob, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);

        return printJob.Id;
    }

    public async Task<IEnumerable<PrintJobDto>> GetPrintJobsAsync(CancellationToken cancellationToken = default)
    {
        return await dbContext.PrintJobs
            .AsNoTracking()
            .Include(j => j.ModelPrint)
            .Include(j => j.Filament)
            .OrderByDescending(j => j.PrintedAt)
            .Select(j => new PrintJobDto
            {
                Id = j.Id,
                ModelPrintId = j.ModelPrintId,
                ModelPrintName = j.ModelPrint != null ? j.ModelPrint.Name : null,
                FilamentId = j.FilamentId,
                FilamentName = j.Filament != null && j.Filament.Color != null ? j.Filament.Color.Name : null,
                ProducedQuantity = j.ProducedQuantity,
                UsedWeightGrams = j.UsedWeightGrams,
                PrintedAt = j.PrintedAt,
                CalculatedMaterialCost = j.CalculatedMaterialCost,
                Notes = j.Notes
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<PrintJobDto> GetPrintJobByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var printJob = await dbContext.PrintJobs
            .AsNoTracking()
            .Include(j => j.ModelPrint)
            .Include(j => j.Filament)
            .ThenInclude(f => f.Color)
            .FirstOrDefaultAsync(j => j.Id == id, cancellationToken)
            ?? throw new ResourceNotFoundException($"PrintJob with ID {id} was not found.");

        return new PrintJobDto
        {
            Id = printJob.Id,
            ModelPrintId = printJob.ModelPrintId,
            ModelPrintName = printJob.ModelPrint?.Name,
            FilamentId = printJob.FilamentId,
            FilamentName = printJob.Filament?.Color?.Name,
            ProducedQuantity = printJob.ProducedQuantity,
            UsedWeightGrams = printJob.UsedWeightGrams,
            PrintedAt = printJob.PrintedAt,
            CalculatedMaterialCost = printJob.CalculatedMaterialCost,
            Notes = printJob.Notes
        };
    }
}
