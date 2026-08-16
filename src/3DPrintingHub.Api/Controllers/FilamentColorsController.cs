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

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] FilamentColorUpdateDto dto, CancellationToken cancellationToken)
    {
        if (id != dto.Id)
        {
            return BadRequest("The route id does not match the id in the request body.");
        }

        await filamentColorService.UpdateFilamentColorAsync(dto, cancellationToken);
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        await filamentColorService.DeleteFilamentColorAsync(id, cancellationToken);
        return NoContent();
    }
}
