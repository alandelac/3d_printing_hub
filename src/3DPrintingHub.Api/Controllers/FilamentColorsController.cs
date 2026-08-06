using Microsoft.AspNetCore.Mvc;
using _3DPrintingHub.Application.Dtos;
using _3DPrintingHub.Application.Services;

namespace _3DPrintingHub.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FilamentColorsController : ControllerBase
{
    private readonly IFilamentColorService _filamentColorService;
    
    public FilamentColorsController(IFilamentColorService filamentColorService)
    {
        _filamentColorService = filamentColorService;
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] FilamentColorCreateDto dto, CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var id = await _filamentColorService.CreateFilamentColorAsync(dto, cancellationToken);
        var location = $"/api/filamentcolors/{id}";
        return Created(location, new { id });
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var filamentColors = await _filamentColorService.GetAllFilamentColorsAsync(cancellationToken);
        return Ok(filamentColors);
    }
}
