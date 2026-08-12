using _3DPrintingHub.Application.Dtos;

namespace _3DPrintingHub.Application.Services;

public interface IProductStockService
{
    /// <summary>
    /// Creates a new ProductStock record and returns its Id.
    /// </summary>
    Task<Guid> CreateProductStockAsync(ProductStockCreateDto dto, CancellationToken cancellationToken = default);

    /// <summary>
    /// Retrieves all ProductStock records with their related model print and filament information.
    /// </summary>
    Task<IEnumerable<ProductStockDto>> GetAllProductStocksAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Deletes a ProductStock record by its Id and returns the deleted ProductStock data.
    /// </summary>
    Task<ProductStockDto> DeleteProductStockAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates a ProductStock record by its Id with the provided fields and returns the updated ProductStock data.
    /// </summary>
    Task<ProductStockDto> UpdateProductStockAsync(ProductStockUpdateDto dto, CancellationToken cancellationToken = default);

    /// <summary>
    /// Adjusts the quantity in stock of a ProductStock by adding or reducing the specified amount.
    /// If the resulting quantity is less than 0, it will be set to 0.
    /// </summary>
    Task<ProductStockDto> AdjustProductStockQuantityAsync(Guid productStockId, int quantity, CancellationToken cancellationToken = default);
}
