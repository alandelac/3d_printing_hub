using _3DPrintingHub.Application.Dtos;
using _3DPrintingHub.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace _3DPrintingHub.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class SalesController(ISaleService saleService) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] SaleCreateDto dto, CancellationToken cancellationToken)
    {
        var id = await saleService.CreateSaleAsync(dto, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id }, new { id });
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var sales = await saleService.GetSalesAsync(cancellationToken);
        return Ok(sales);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        var sale = await saleService.GetSaleByIdAsync(id, cancellationToken);
        return Ok(sale);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] SaleUpdateDto dto, CancellationToken cancellationToken)
    {
        if (id != dto.Id)
        {
            return BadRequest("The route id does not match the id in the request body.");
        }

        var updatedSale = await saleService.UpdateSaleAsync(dto, cancellationToken);
        return Ok(updatedSale);
    }
}
