using Microsoft.AspNetCore.Mvc;
using _3DPrintingHub.Application.Dtos;
using _3DPrintingHub.Application.Services;

namespace _3DPrintingHub.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MarketplacesController : ControllerBase
{
    private readonly IMarketplaceService _marketplaceService;

    public MarketplacesController(IMarketplaceService marketplaceService)
    {
        _marketplaceService = marketplaceService;
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] MarketplaceCreateDto dto, CancellationToken cancellationToken)
    {
        var id = await _marketplaceService.CreateMarketplaceAsync(dto, cancellationToken);
        var location = $"/api/marketplaces/{id}";
        return Created(location, new { id });
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var marketplaces = await _marketplaceService.GetAllMarketplacesAsync(cancellationToken);
        return Ok(marketplaces);
    }
}
