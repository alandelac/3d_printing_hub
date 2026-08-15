using Microsoft.EntityFrameworkCore;
using _3DPrintingHub.Application.Dtos;
using _3DPrintingHub.Application.Services;
using _3DPrintingHub.Domain.Entities;
using _3DPrintingHub.Infrastructure.Data;

namespace _3DPrintingHub.Infrastructure.Services;

public class ProductStockService(ApplicationDbContext dbContext, IPrintPricingService printPricingService) : IProductStockService
{
    public async Task<Guid> CreateProductStockAsync(ProductStockCreateDto dto, CancellationToken cancellationToken = default)
    {
        // Validate that the ModelPrintId exists
        var modelPrint = await dbContext.ModelPrints
            .FirstOrDefaultAsync(mp => mp.Id == dto.ModelPrintId, cancellationToken)
            ?? throw new InvalidOperationException($"ModelPrint with ID {dto.ModelPrintId} does not exist.");

        // Validate that the FilamentId exists
        var filament = await dbContext.Filaments
            .FirstOrDefaultAsync(f => f.Id == dto.FilamentId, cancellationToken)
            ?? throw new InvalidOperationException($"Filament with ID {dto.FilamentId} does not exist.");

        // CostToProduce is calculated automatically from the selected filament's MaxCost
        // (unlike ModelPrint, which uses the average MaxCost of all filaments)
        var costToProduce = await printPricingService.CalculateCostUsingFilamentAsync(
            modelPrint.EstimatedWeightGrams,
            modelPrint.EstimatedTimeMinutes,
            filament.MaxCost,
            cancellationToken);

        var recommendedSalePrice = costToProduce * 2;

        // Use the user-provided sale price if specified (> 0), otherwise default to recommended
        var salePrice = dto.SalePrice > 0 ? dto.SalePrice : recommendedSalePrice;

        var productStock = new ProductStock
        {
            ModelPrintId = dto.ModelPrintId,
            FilamentId = dto.FilamentId,
            QuantityInStock = dto.QuantityInStock,
            CostToProduce = costToProduce,
            RecommendedSalePrice = recommendedSalePrice,
            SalePrice = salePrice,
            LastUpdated = DateTime.UtcNow
        };

        await dbContext.ProductStocks.AddAsync(productStock, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);

        return productStock.Id;
    }

    public async Task<IEnumerable<ProductStockDto>> GetAllProductStocksAsync(CancellationToken cancellationToken = default)
    {
        var productStocks = await dbContext.ProductStocks
            .Include(ps => ps.ModelPrint)
            .Include(ps => ps.Filament)
                .ThenInclude(f => f.Color)
            .ToListAsync(cancellationToken);

                        var result = productStocks.Select(ps => ToDto(ps)).ToList();

        return result;
    }

    public async Task<ProductStockDto> DeleteProductStockAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var productStock = await dbContext.ProductStocks
            .Include(ps => ps.ModelPrint)
            .Include(ps => ps.Filament)
                .ThenInclude(f => f.Color)
            .FirstOrDefaultAsync(ps => ps.Id == id, cancellationToken)
            ?? throw new InvalidOperationException($"ProductStock with ID {id} does not exist.");

        var deletedDto = ToDto(productStock);

        dbContext.ProductStocks.Remove(productStock);
        await dbContext.SaveChangesAsync(cancellationToken);

        return deletedDto;
    }

    public async Task<ProductStockDto> UpdateProductStockAsync(ProductStockUpdateDto dto, CancellationToken cancellationToken = default)
    {
        var productStock = await dbContext.ProductStocks
            .Include(ps => ps.ModelPrint)
            .Include(ps => ps.Filament)
                .ThenInclude(f => f.Color)
            .FirstOrDefaultAsync(ps => ps.Id == dto.Id, cancellationToken)
            ?? throw new InvalidOperationException($"ProductStock with ID {dto.Id} does not exist.");

        if (dto.ModelPrintId.HasValue)
        {
            var modelPrint = await dbContext.ModelPrints
                .FirstOrDefaultAsync(mp => mp.Id == dto.ModelPrintId.Value, cancellationToken)
                ?? throw new InvalidOperationException($"ModelPrint with ID {dto.ModelPrintId.Value} does not exist.");
            productStock.ModelPrintId = dto.ModelPrintId.Value;
        }

        if (dto.FilamentId.HasValue)
        {
            var filament = await dbContext.Filaments
                .FirstOrDefaultAsync(f => f.Id == dto.FilamentId.Value, cancellationToken)
                ?? throw new InvalidOperationException($"Filament with ID {dto.FilamentId.Value} does not exist.");
            productStock.FilamentId = dto.FilamentId.Value;
        }

        if (dto.QuantityInStock.HasValue)
        {
            productStock.QuantityInStock = dto.QuantityInStock.Value;
        }

        // CostToProduce is calculated automatically from the (possibly updated) model and filament.
        var modelForCost = await dbContext.ModelPrints
            .FirstAsync(mp => mp.Id == productStock.ModelPrintId, cancellationToken);
        var filamentForCost = await dbContext.Filaments
            .FirstAsync(f => f.Id == productStock.FilamentId, cancellationToken);
        productStock.CostToProduce = await printPricingService.CalculateCostUsingFilamentAsync(
            modelForCost.EstimatedWeightGrams,
            modelForCost.EstimatedTimeMinutes,
            filamentForCost.MaxCost,
            cancellationToken);

        // Recommended sale price is always double the cost.
        productStock.RecommendedSalePrice = productStock.CostToProduce * 2;

        // Keep a specific user-provided sale price; otherwise fall back to the recommended one.
        if (dto.SalePrice.HasValue && dto.SalePrice.Value > 0)
        {
            productStock.SalePrice = dto.SalePrice.Value;
        }
        else
        {
            productStock.SalePrice = productStock.RecommendedSalePrice;
        }

        productStock.LastUpdated = DateTime.UtcNow;

        await dbContext.SaveChangesAsync(cancellationToken);

        // Re-fetch with includes to reflect any FK changes
        var updatedProductStock = await dbContext.ProductStocks
            .Include(ps => ps.ModelPrint)
            .Include(ps => ps.Filament)
                .ThenInclude(f => f.Color)
            .FirstOrDefaultAsync(ps => ps.Id == dto.Id, cancellationToken)
            ?? throw new InvalidOperationException($"ProductStock with ID {dto.Id} does not exist.");

        return ToDto(updatedProductStock);
    }

    public async Task<ProductStockDto> AdjustProductStockQuantityAsync(Guid productStockId, int quantity, CancellationToken cancellationToken = default)
    {
        var productStock = await dbContext.ProductStocks
            .Include(ps => ps.ModelPrint)
            .Include(ps => ps.Filament)
                .ThenInclude(f => f.Color)
            .FirstOrDefaultAsync(ps => ps.Id == productStockId, cancellationToken)
            ?? throw new InvalidOperationException($"ProductStock with ID {productStockId} does not exist.");

        productStock.QuantityInStock = Math.Max(0, productStock.QuantityInStock + quantity);
        productStock.LastUpdated = DateTime.UtcNow;

        await dbContext.SaveChangesAsync(cancellationToken);

        return ToDto(productStock);
    }

    private static ProductStockDto ToDto(ProductStock ps)
    {
        return new ProductStockDto
        {
            Id = ps.Id,
            ModelPrintId = ps.ModelPrintId,
            ModelPrintName = ps.ModelPrint != null ? ps.ModelPrint.Name : $"Unknown Model ({ps.ModelPrintId})",
            FilamentId = ps.FilamentId,
            FilamentColorName = ps.Filament?.Color != null ? ps.Filament.Color.Name : $"Unknown Color ({ps.FilamentId})",
            FilamentColorCode = ps.Filament?.Color?.ColorCode ?? string.Empty,
            QuantityInStock = ps.QuantityInStock,
            CostToProduce = ps.CostToProduce,
            RecommendedSalePrice = ps.RecommendedSalePrice,
            SalePrice = ps.SalePrice,
            LastUpdated = ps.LastUpdated
        };
    }
}
