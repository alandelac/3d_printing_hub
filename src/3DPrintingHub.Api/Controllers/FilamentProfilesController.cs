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
}
