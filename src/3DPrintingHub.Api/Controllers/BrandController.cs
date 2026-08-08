using Microsoft.AspNetCore.Mvc;
using _3DPrintingHub.Application.Dtos;
using _3DPrintingHub.Application.Services;

namespace _3DPrintingHub.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BrandController(IBrandService brandService) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] BrandCreateDto dto, CancellationToken cancellationToken)
    {
        var id = await brandService.CreateBrandAsync(dto, cancellationToken);
        var location = $"/api/brands/{id}";
        return Created(location, new { id });
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var brands = await brandService.GetAllBrandsAsync(cancellationToken);
        return Ok(brands);
    }
}
