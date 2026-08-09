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

    /// <summary>
    /// Updates a Filament record by its Id with the provided fields and returns the updated Filament data.
    /// </summary>
    /// <param name="dto">The update payload.</param>
    /// <param name="cancellationToken"></param>
    /// <returns>The updated FilamentDto.</returns>
    [HttpPut]
    public async Task<IActionResult> Update([FromBody] FilamentUpdateDto dto, CancellationToken cancellationToken)
    {
        var updatedFilament = await filamentService.UpdateFilamentAsync(dto, cancellationToken);
        return Ok(updatedFilament);
    }

    /// <summary>
    /// Adjusts the remaining weight of a Filament by adding or reducing the specified amount of grams.
    /// If the resulting weight is less than 0, it will be set to 0.
    /// </summary>
    /// <param name="id">The Id of the Filament to adjust.</param>
    /// <param name="dto">The adjustment payload containing the grams to add or reduce.</param>
    /// <param name="cancellationToken"></param>
    /// <returns>The updated FilamentDto.</returns>
    [HttpPut("{id}/adjust-weight")]
    public async Task<IActionResult> AdjustWeight(Guid id, [FromBody] AdjustFilamentWeightDto dto, CancellationToken cancellationToken)
    {
        if (id != dto.FilamentId)
        {
            return BadRequest(new { message = "The filament id in the route does not match the one in the body." });
        }

        var updatedFilament = await filamentService.AdjustFilamentWeightAsync(dto.FilamentId, dto.Grams, cancellationToken);
        return Ok(updatedFilament);
    }
    
}
