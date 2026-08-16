using Microsoft.AspNetCore.Mvc;
using _3DPrintingHub.Application.Dtos;
using _3DPrintingHub.Application.Services;

namespace _3DPrintingHub.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FilamentProfilesController(IFilamentProfileService filamentProfileService) : ControllerBase
{

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] FilamentProfileCreateDto dto, CancellationToken cancellationToken)
    {
        var id = await filamentProfileService.CreateFilamentProfileAsync(dto, cancellationToken);
        var location = $"/api/filamentprofiles/{id}";
        return Created(location, new { id });
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var filamentProfiles = await filamentProfileService.GetAllFilamentProfilesAsync(cancellationToken);
        return Ok(filamentProfiles);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] FilamentProfileUpdateDto dto, CancellationToken cancellationToken)
    {
        if (id != dto.Id)
        {
            return BadRequest("The route id does not match the id in the request body.");
        }

        await filamentProfileService.UpdateFilamentProfileAsync(dto, cancellationToken);
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        await filamentProfileService.DeleteFilamentProfileAsync(id, cancellationToken);
        return NoContent();
    }
}
