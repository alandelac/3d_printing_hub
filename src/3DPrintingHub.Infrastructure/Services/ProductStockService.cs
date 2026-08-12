using Microsoft.EntityFrameworkCore;
using _3DPrintingHub.Application.Dtos;
using _3DPrintingHub.Application.Services;
using _3DPrintingHub.Domain.Entities;
using _3DPrintingHub.Infrastructure.Data;

namespace _3DPrintingHub.Infrastructure.Services;

public class ProductStockService(ApplicationDbContext dbContext) : IProductStockService
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

        var productStock = new ProductStock
        {
            ModelPrintId = dto.ModelPrintId,
            FilamentId = dto.FilamentId,
            QuantityInStock = dto.QuantityInStock,
            CostToProduce = dto.CostToProduce,
            SalePrice = dto.SalePrice,
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

        if (dto.CostToProduce.HasValue)
        {
            productStock.CostToProduce = dto.CostToProduce.Value;
        }

        if (dto.SalePrice.HasValue)
        {
            productStock.SalePrice = dto.SalePrice.Value;
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
            SalePrice = ps.SalePrice,
            LastUpdated = ps.LastUpdated
        };
    }
}
