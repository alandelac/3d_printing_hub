using Microsoft.AspNetCore.Mvc;
using _3DPrintingHub.Application.Dtos;
using _3DPrintingHub.Application.Services;

namespace _3DPrintingHub.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FilamentColorsController(IFilamentColorService filamentColorService) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] FilamentColorCreateDto dto, CancellationToken cancellationToken)
    {
        var id = await filamentColorService.CreateFilamentColorAsync(dto, cancellationToken);
        var location = $"/api/filamentcolors/{id}";
        return Created(location, new { id });
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var filamentColors = await filamentColorService.GetAllFilamentColorsAsync(cancellationToken);
        return Ok(filamentColors);
    }
}
