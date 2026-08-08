using Microsoft.AspNetCore.Mvc;
using _3DPrintingHub.Application.Dtos;
using _3DPrintingHub.Application.Services;

namespace _3DPrintingHub.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MarketplacesController(IMarketplaceService marketplaceService) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] MarketplaceCreateDto dto, CancellationToken cancellationToken)
    {
        var id = await marketplaceService.CreateMarketplaceAsync(dto, cancellationToken);
        var location = $"/api/marketplaces/{id}";
        return Created(location, new { id });
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var marketplaces = await marketplaceService.GetAllMarketplacesAsync(cancellationToken);
        return Ok(marketplaces);
    }
}
