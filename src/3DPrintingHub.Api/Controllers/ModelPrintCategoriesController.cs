using Microsoft.AspNetCore.Mvc;
using _3DPrintingHub.Application.Dtos;
using _3DPrintingHub.Application.Services;

namespace _3DPrintingHub.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ModelPrintCategoriesController(IModelPrintCategoryService categoryService) : ControllerBase
{
    /// <summary>
    /// Creates a new model print category.
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] ModelPrintCategoryCreateDto dto, CancellationToken cancellationToken)
    {
        var id = await categoryService.CreateModelPrintCategoryAsync(dto, cancellationToken);
        var location = $"/api/modelprintcategories/{id}";
        return Created(location, new { id });
    }

    /// <summary>
    /// Retrieves all model print categories sorted alphabetically by name.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var categories = await categoryService.GetAllModelPrintCategoriesAsync(cancellationToken);
        return Ok(categories);
    }

    /// <summary>
    /// Updates the name of an existing model print category.
    /// </summary>
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] ModelPrintCategoryUpdateDto dto, CancellationToken cancellationToken)
    {
        if (id != dto.Id)
        {
            return BadRequest("The route id does not match the id in the request body.");
        }

        await categoryService.UpdateModelPrintCategoryAsync(dto, cancellationToken);
        return NoContent();
    }

    /// <summary>
    /// Deletes a model print category by its Id.
    /// </summary>
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        await categoryService.DeleteModelPrintCategoryAsync(id, cancellationToken);
        return NoContent();
    }
}
