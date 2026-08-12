using Microsoft.AspNetCore.Mvc;
using _3DPrintingHub.Application.Dtos;
using _3DPrintingHub.Application.Services;

namespace _3DPrintingHub.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductStockController(IProductStockService productStockService) : ControllerBase
{
    /// <summary>
    /// Creates a new ProductStock record.
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] ProductStockCreateDto dto, CancellationToken cancellationToken)
    {
        var id = await productStockService.CreateProductStockAsync(dto, cancellationToken);
        var location = $"/api/productstock/{id}";
        return Created(location, new { id });
    }

    /// <summary>
    /// Retrieves all ProductStock records.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var productStocks = await productStockService.GetAllProductStocksAsync(cancellationToken);
        return Ok(productStocks);
    }

    /// <summary>
    /// Deletes a ProductStock record by its Id and returns the deleted ProductStock data.
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var deletedProductStock = await productStockService.DeleteProductStockAsync(id, cancellationToken);
        return Ok(deletedProductStock);
    }

    /// <summary>
    /// Updates a ProductStock record by its Id with the provided fields and returns the updated ProductStock data.
    /// </summary>
    [HttpPut]
    public async Task<IActionResult> Update([FromBody] ProductStockUpdateDto dto, CancellationToken cancellationToken)
    {
        var updatedProductStock = await productStockService.UpdateProductStockAsync(dto, cancellationToken);
        return Ok(updatedProductStock);
    }

    /// <summary>
    /// Adjusts the quantity in stock of a ProductStock by adding or reducing the specified amount.
    /// Positive values add to the stock, negative values reduce it.
    /// If the resulting quantity is less than 0, it will be set to 0.
    /// </summary>
    [HttpPut("{id}/adjust-quantity")]
    public async Task<IActionResult> AdjustQuantity(Guid id, [FromBody] AdjustProductStockQuantityDto dto, CancellationToken cancellationToken)
    {
        if (id != dto.ProductStockId)
        {
            return BadRequest(new { message = "The product stock id in the route does not match the one in the body." });
        }

        var updatedProductStock = await productStockService.AdjustProductStockQuantityAsync(dto.ProductStockId, dto.Quantity, cancellationToken);
        return Ok(updatedProductStock);
    }
}
