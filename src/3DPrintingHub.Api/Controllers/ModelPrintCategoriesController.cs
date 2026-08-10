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
}
