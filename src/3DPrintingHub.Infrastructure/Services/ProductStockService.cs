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
                .ThenInclude(f => f!.Color)
            .ToListAsync(cancellationToken);

        var result = productStocks.Select(ps => ToDto(ps)).ToList();

        return result;
    }

    public async Task<ProductStockDto> DeleteProductStockAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var productStock = await dbContext.ProductStocks
            .Include(ps => ps.ModelPrint)
            .Include(ps => ps.Filament)
                .ThenInclude(f => f!.Color)
            .FirstOrDefaultAsync(ps => ps.Id == id, cancellationToken)
            ?? throw new InvalidOperationException($"ProductStock with ID {id} does not exist.");

        var deletedDto = ToDto(productStock);

        dbContext.ProductStocks.Remove(productStock);
        await dbContext.SaveChangesAsync(cancellationToken);

        return deletedDto;
    }

    public async Task<ProductStockDto> UpdateProductStockAsync(ProductStockUpdateDto dto, CancellationToken cancellationToken = default)
    {
        // 1. Cargamos el registro principal CON sus relaciones actuales
        var productStock = await dbContext.ProductStocks
            .Include(ps => ps.ModelPrint)
            .Include(ps => ps.Filament)
                .ThenInclude(f => f!.Color)
            .FirstOrDefaultAsync(ps => ps.Id == dto.Id, cancellationToken)
            ?? throw new InvalidOperationException($"ProductStock with ID {dto.Id} does not exist.");

        // 2. Validar y actualizar ModelPrint SOLO si realmente cambió
        if (dto.ModelPrintId.HasValue && dto.ModelPrintId.Value != productStock.ModelPrintId)
        {
            var newModelPrint = await dbContext.ModelPrints
                .FirstOrDefaultAsync(mp => mp.Id == dto.ModelPrintId.Value, cancellationToken)
                ?? throw new InvalidOperationException($"ModelPrint with ID {dto.ModelPrintId.Value} does not exist.");

            productStock.ModelPrintId = dto.ModelPrintId.Value;
            productStock.ModelPrint = newModelPrint; // Actualizamos la navegación en memoria
        }

        // 3. Validar y actualizar Filament SOLO si realmente cambió
        if (dto.FilamentId.HasValue && dto.FilamentId.Value != productStock.FilamentId)
        {
            var newFilament = await dbContext.Filaments
                .Include(f => f!.Color) // Aseguramos incluir el color para el DTO
                .FirstOrDefaultAsync(f => f.Id == dto.FilamentId.Value, cancellationToken)
                ?? throw new InvalidOperationException($"Filament with ID {dto.FilamentId.Value} does not exist.");

            productStock.FilamentId = dto.FilamentId.Value;
            productStock.Filament = newFilament; // Actualizamos la navegación en memoria
        }

        if (dto.QuantityInStock.HasValue)
        {
            productStock.QuantityInStock = dto.QuantityInStock.Value;
        }

        // 4. Calcular costos usando las entidades que YA tenemos en memoria (evitamos 2 queries extra)
        productStock.CostToProduce = await printPricingService.CalculateCostUsingFilamentAsync(
            productStock.ModelPrint!.EstimatedWeightGrams,
            productStock.ModelPrint!.EstimatedTimeMinutes,
            productStock.Filament!.MaxCost,
            cancellationToken);

        productStock.RecommendedSalePrice = productStock.CostToProduce * 2;

        if (dto.SalePrice.HasValue && dto.SalePrice.Value > 0)
        {
            productStock.SalePrice = dto.SalePrice.Value;
        }
        else
        {
            productStock.SalePrice = productStock.RecommendedSalePrice;
        }

        productStock.LastUpdated = DateTime.UtcNow;
        productStock.Version++;

        // 5. Guardar cambios (EF Core detectará qué columnas cambiaron realmente)
        await dbContext.SaveChangesAsync(cancellationToken);

        // 6. ¡Ya no necesitamos hacer un Re-fetch! 
        // Como actualizamos productStock.ModelPrint y productStock.Filament manualmente arriba,
        // el objeto 'productStock' ya está completo y listo para tu mapeador.
        return ToDto(productStock);
    }

    public async Task<ProductStockDto> AdjustProductStockQuantityAsync(Guid productStockId, int quantity, CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        var query = dbContext.ProductStocks.Where(ps => ps.Id == productStockId);

        if (quantity < 0)
        {
            var reduction = -(long)quantity;
            query = query.Where(ps => (long)ps.QuantityInStock >= reduction);
        }
        else
        {
            query = query.Where(ps => ps.QuantityInStock <= int.MaxValue - quantity);
        }

        var rowsAffected = await query.ExecuteUpdateAsync(setters => setters
            .SetProperty(ps => ps.QuantityInStock, ps => ps.QuantityInStock + quantity)
            .SetProperty(ps => ps.Version, ps => ps.Version + 1)
            .SetProperty(ps => ps.LastUpdated, now), cancellationToken);

        if (rowsAffected == 0)
        {
            var exists = await dbContext.ProductStocks.AnyAsync(ps => ps.Id == productStockId, cancellationToken);
            if (!exists)
                throw new InvalidOperationException($"ProductStock with ID {productStockId} does not exist.");

            throw new _3DPrintingHub.Application.Exceptions.ResourceConflictException(
                "The requested reduction exceeds the available stock.");
        }

        var updatedProductStock = await dbContext.ProductStocks
            .Include(ps => ps.ModelPrint)
            .Include(ps => ps.Filament)
                .ThenInclude(f => f!.Color)
            .FirstAsync(ps => ps.Id == productStockId, cancellationToken);

        return ToDto(updatedProductStock);
    }

    public async Task<ProductStockDto> UpdateProductStockQuantityAsync(Guid productStockId, int quantity, int expectedVersion, CancellationToken cancellationToken = default)
    {
        var rowsAffected = await dbContext.ProductStocks
            .Where(ps => ps.Id == productStockId && ps.Version == expectedVersion)
            .ExecuteUpdateAsync(setters => setters
                .SetProperty(ps => ps.QuantityInStock, quantity)
                .SetProperty(ps => ps.Version, ps => ps.Version + 1)
                .SetProperty(ps => ps.LastUpdated, DateTime.UtcNow),
                cancellationToken);

        if (rowsAffected == 0)
        {
            var productStock = await dbContext.ProductStocks
                .AsNoTracking()
                .FirstOrDefaultAsync(ps => ps.Id == productStockId, cancellationToken)
                ?? throw new InvalidOperationException($"ProductStock with ID {productStockId} does not exist.");

            throw new _3DPrintingHub.Application.Exceptions.ResourceConflictException(
                $"ProductStock was changed by another request. Current version is {productStock.Version}.");
        }

        var updatedProductStock = await dbContext.ProductStocks
            .Include(ps => ps.ModelPrint)
            .Include(ps => ps.Filament)
                .ThenInclude(f => f!.Color)
            .FirstAsync(ps => ps.Id == productStockId, cancellationToken);

        return ToDto(updatedProductStock);
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
            Version = ps.Version,
            CostToProduce = ps.CostToProduce,
            RecommendedSalePrice = ps.RecommendedSalePrice,
            SalePrice = ps.SalePrice,
            LastUpdated = ps.LastUpdated
        };
    }
}
