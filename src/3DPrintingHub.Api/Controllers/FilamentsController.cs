using Microsoft.AspNetCore.Mvc;
using _3DPrintingHub.Application.Dtos;
using _3DPrintingHub.Application.Services;

namespace _3DPrintingHub.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FilamentsController(IFilamentService filamentService) : ControllerBase
{
    /// <summary>
    /// Creates a new Filament record.
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] FilamentCreateDto dto, CancellationToken cancellationToken)
    {
        var id = await filamentService.CreateFilamentAsync(dto, cancellationToken);
        var location = $"/api/filaments/{id}";
        return Created(location, new { id });
    }

    /// <summary>
    /// Retrieves all Filament records.
    /// </summary>
    /// <param name="cancellationToken"></param>
    /// <returns></returns>
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var filaments = await filamentService.GetAllFilamentsAsync(cancellationToken);
        return Ok(filaments);
    }

    /// <summary>
    /// Deletes a Filament record by its Id and returns the deleted Filament data.
    /// </summary>
    /// <param name="id">The Id of the Filament to delete.</param>
    /// <param name="cancellationToken"></param>
    /// <returns>The deleted FilamentDto.</returns>
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var deletedFilament = await filamentService.DeleteFilamentAsync(id, cancellationToken);
        return Ok(deletedFilament);
    }
    
}
