using Microsoft.AspNetCore.Mvc;
using _3DPrintingHub.Application.Dtos;
using _3DPrintingHub.Application.Services;

namespace _3DPrintingHub.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ModelPrintsController(IModelPrintService modelPrintService) : ControllerBase
{
    /// <summary>
    /// Creates a new ModelPrint record with calculated DefaultCost and DefaultSalePrice.
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] ModelPrintCreateDto dto, CancellationToken cancellationToken)
    {
        var result = await modelPrintService.CreateModelPrintAsync(dto, cancellationToken);
        var location = $"/api/modelprints/{result.Id}";
        return Created(location, result);
    }

    /// <summary>
    /// Retrieves all ModelPrint records.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var models = await modelPrintService.GetAllModelPrintsAsync(cancellationToken);
        return Ok(models);
    }
}
