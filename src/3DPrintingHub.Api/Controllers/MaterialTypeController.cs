using Microsoft.AspNetCore.Mvc;
using _3DPrintingHub.Application.Dtos;
using _3DPrintingHub.Application.Services;

namespace _3DPrintingHub.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MaterialTypeController(IMaterialTypeService materialTypeService) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] MaterialTypeCreateDto dto, CancellationToken cancellationToken)
    {
        var id = await materialTypeService.CreateMaterialTypeAsync(dto, cancellationToken);
        var location = $"/api/materialtypes/{id}";
        return Created(location, new { id });
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var materialTypes = await materialTypeService.GetAllMaterialTypesAsync(cancellationToken);
        return Ok(materialTypes);
    }
}
