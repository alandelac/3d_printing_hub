using _3DPrintingHub.Application.Dtos;
using _3DPrintingHub.Application.Exceptions;
using _3DPrintingHub.Application.Services;
using _3DPrintingHub.Domain.Entities;
using _3DPrintingHub.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace _3DPrintingHub.Infrastructure.Services;

public class SaleService(ApplicationDbContext dbContext) : ISaleService
{
    public async Task<Guid> CreateSaleAsync(SaleCreateDto dto, CancellationToken cancellationToken = default)
    {
        if (dto.ProductStockId == Guid.Empty)
            throw new BusinessRuleException("ProductStockId is required.");

        if (dto.PaymentReceived is null)
            throw new BusinessRuleException("PaymentReceived must be explicitly provided.");

        if (dto.Quantity <= 0)
            throw new BusinessRuleException("Quantity must be greater than zero.");

        if (dto.SalePrice <= 0)
            throw new BusinessRuleException("Sale price must be greater than zero.");

        if (dto.ClientId == Guid.Empty)
            dto.ClientId = null;

        var productStock = await dbContext.ProductStocks
            .FirstOrDefaultAsync(ps => ps.Id == dto.ProductStockId, cancellationToken)
            ?? throw new ResourceNotFoundException($"ProductStock with ID {dto.ProductStockId} was not found.");

        if (dto.ClientId.HasValue)
        {
            var clientExists = await dbContext.Clients
                .AnyAsync(c => c.Id == dto.ClientId.Value, cancellationToken);

            if (!clientExists)
                throw new ResourceNotFoundException($"Client with ID {dto.ClientId.Value} was not found.");
        }

        if (productStock.QuantityInStock < dto.Quantity)
            throw new ResourceConflictException("The requested sale quantity exceeds the available stock.");

        using var transaction = await dbContext.Database.BeginTransactionAsync(cancellationToken);

        var rowsAffected = await dbContext.ProductStocks
            .Where(ps => ps.Id == productStock.Id && ps.Version == productStock.Version)
            .ExecuteUpdateAsync(setters => setters
                .SetProperty(ps => ps.QuantityInStock, ps => ps.QuantityInStock - dto.Quantity)
                .SetProperty(ps => ps.Version, ps => ps.Version + 1)
                .SetProperty(ps => ps.LastUpdated, DateTime.UtcNow), cancellationToken);

        if (rowsAffected == 0)
            throw new ResourceConflictException("The selected stock row was changed by another request.");

        var sale = new Sale
        {
            ProductStockId = dto.ProductStockId,
            ClientId = dto.ClientId,
            Quantity = dto.Quantity,
            SalePrice = dto.SalePrice,
            PaymentReceived = dto.PaymentReceived.Value,
            SoldAtUtc = DateTime.UtcNow
        };

        await dbContext.Sales.AddAsync(sale, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);

        return sale.Id;
    }

    public async Task<IEnumerable<SaleDto>> GetSalesAsync(CancellationToken cancellationToken = default)
    {
        return await dbContext.Sales
            .AsNoTracking()
            .Include(s => s.Client)
            .OrderBy(s => s.SoldAtUtc)
            .Select(s => new SaleDto
            {
                Id = s.Id,
                ProductStockId = s.ProductStockId,
                ClientId = s.ClientId,
                ClientName = s.Client != null ? s.Client.Name : null,
                Quantity = s.Quantity,
                SalePrice = s.SalePrice,
                PaymentReceived = s.PaymentReceived,
                SoldAtUtc = s.SoldAtUtc
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<SaleDto> GetSaleByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var sale = await dbContext.Sales
            .AsNoTracking()
            .Include(s => s.Client)
            .FirstOrDefaultAsync(s => s.Id == id, cancellationToken)
            ?? throw new ResourceNotFoundException($"Sale with ID {id} was not found.");

        return MapToDto(sale);
    }

    public async Task<SaleDto> UpdateSaleAsync(SaleUpdateDto dto, CancellationToken cancellationToken = default)
    {
        if (dto.Id == Guid.Empty)
            throw new BusinessRuleException("Sale id is required.");

        if (dto.ProductStockId == Guid.Empty)
            throw new BusinessRuleException("ProductStockId is required.");

        if (dto.PaymentReceived is null)
            throw new BusinessRuleException("PaymentReceived must be explicitly provided.");

        if (dto.Quantity <= 0)
            throw new BusinessRuleException("Quantity must be greater than zero.");

        if (dto.SalePrice <= 0)
            throw new BusinessRuleException("Sale price must be greater than zero.");

        if (dto.ClientId == Guid.Empty)
            dto.ClientId = null;

        var sale = await dbContext.Sales
            .Include(s => s.Client)
            .FirstOrDefaultAsync(s => s.Id == dto.Id, cancellationToken)
            ?? throw new ResourceNotFoundException($"Sale with ID {dto.Id} was not found.");

        if (dto.ClientId.HasValue)
        {
            var clientExists = await dbContext.Clients
                .AnyAsync(c => c.Id == dto.ClientId.Value, cancellationToken);

            if (!clientExists)
                throw new ResourceNotFoundException($"Client with ID {dto.ClientId.Value} was not found.");
        }

        var existingProductStock = await dbContext.ProductStocks
            .FirstOrDefaultAsync(ps => ps.Id == sale.ProductStockId, cancellationToken)
            ?? throw new ResourceNotFoundException($"ProductStock with ID {sale.ProductStockId} was not found.");

        var updatedProductStock = await dbContext.ProductStocks
            .FirstOrDefaultAsync(ps => ps.Id == dto.ProductStockId, cancellationToken)
            ?? throw new ResourceNotFoundException($"ProductStock with ID {dto.ProductStockId} was not found.");

        using var transaction = await dbContext.Database.BeginTransactionAsync(cancellationToken);

        if (sale.ProductStockId == dto.ProductStockId)
        {
            var quantityDelta = dto.Quantity - sale.Quantity;

            if (quantityDelta > 0)
            {
                if (updatedProductStock.QuantityInStock < quantityDelta)
                    throw new ResourceConflictException("The requested sale quantity exceeds the available stock.");

                var rowsAffected = await dbContext.ProductStocks
                    .Where(ps => ps.Id == dto.ProductStockId && ps.Version == updatedProductStock.Version)
                    .ExecuteUpdateAsync(setters => setters
                        .SetProperty(ps => ps.QuantityInStock, ps => ps.QuantityInStock - quantityDelta)
                        .SetProperty(ps => ps.Version, ps => ps.Version + 1)
                        .SetProperty(ps => ps.LastUpdated, DateTime.UtcNow), cancellationToken);

                if (rowsAffected == 0)
                    throw new ResourceConflictException("The selected stock row was changed by another request.");
            }
            else if (quantityDelta < 0)
            {
                var rowsAffected = await dbContext.ProductStocks
                    .Where(ps => ps.Id == dto.ProductStockId && ps.Version == updatedProductStock.Version)
                    .ExecuteUpdateAsync(setters => setters
                        .SetProperty(ps => ps.QuantityInStock, ps => ps.QuantityInStock + Math.Abs(quantityDelta))
                        .SetProperty(ps => ps.Version, ps => ps.Version + 1)
                        .SetProperty(ps => ps.LastUpdated, DateTime.UtcNow), cancellationToken);

                if (rowsAffected == 0)
                    throw new ResourceConflictException("The selected stock row was changed by another request.");
            }
        }
        else
        {
            if (updatedProductStock.QuantityInStock < dto.Quantity)
                throw new ResourceConflictException("The requested sale quantity exceeds the available stock.");

            var oldStockRowsAffected = await dbContext.ProductStocks
                .Where(ps => ps.Id == sale.ProductStockId && ps.Version == existingProductStock.Version)
                .ExecuteUpdateAsync(setters => setters
                    .SetProperty(ps => ps.QuantityInStock, ps => ps.QuantityInStock + sale.Quantity)
                    .SetProperty(ps => ps.Version, ps => ps.Version + 1)
                    .SetProperty(ps => ps.LastUpdated, DateTime.UtcNow), cancellationToken);

            if (oldStockRowsAffected == 0)
                throw new ResourceConflictException("The original stock row was changed by another request.");

            var newStockRowsAffected = await dbContext.ProductStocks
                .Where(ps => ps.Id == dto.ProductStockId && ps.Version == updatedProductStock.Version)
                .ExecuteUpdateAsync(setters => setters
                    .SetProperty(ps => ps.QuantityInStock, ps => ps.QuantityInStock - dto.Quantity)
                    .SetProperty(ps => ps.Version, ps => ps.Version + 1)
                    .SetProperty(ps => ps.LastUpdated, DateTime.UtcNow), cancellationToken);

            if (newStockRowsAffected == 0)
                throw new ResourceConflictException("The replacement stock row was changed by another request.");
        }

        sale.ProductStockId = dto.ProductStockId;
        sale.ClientId = dto.ClientId;
        sale.Quantity = dto.Quantity;
        sale.SalePrice = dto.SalePrice;
        sale.PaymentReceived = dto.PaymentReceived.Value;

        await dbContext.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);

        return MapToDto(sale);
    }

    private static SaleDto MapToDto(Sale sale) => new()
    {
        Id = sale.Id,
        ProductStockId = sale.ProductStockId,
        ClientId = sale.ClientId,
        ClientName = sale.Client?.Name,
        Quantity = sale.Quantity,
        SalePrice = sale.SalePrice,
        PaymentReceived = sale.PaymentReceived,
        SoldAtUtc = sale.SoldAtUtc
    };
}
