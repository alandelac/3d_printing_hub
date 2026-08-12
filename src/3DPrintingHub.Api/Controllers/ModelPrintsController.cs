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

    /// <summary>
    /// Deletes a ModelPrint record by its Id and returns the deleted ModelPrint data.
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var deletedModelPrint = await modelPrintService.DeleteModelPrintAsync(id, cancellationToken);
        return Ok(deletedModelPrint);
    }

    /// <summary>
    /// Updates a ModelPrint record by its Id with the provided fields and returns the updated ModelPrint data.
    /// DefaultCost and DefaultSalePrice are recalculated when EstimatedWeightGrams or EstimatedTimeMinutes are provided.
    /// </summary>
    [HttpPut]
    public async Task<IActionResult> Update([FromBody] ModelPrintUpdateDto dto, CancellationToken cancellationToken)
    {
        var updatedModelPrint = await modelPrintService.UpdateModelPrintAsync(dto, cancellationToken);
        return Ok(updatedModelPrint);
    }
}