using Microsoft.AspNetCore.Mvc;
using _3DPrintingHub.Application.Dtos;
using _3DPrintingHub.Application.Services;

namespace _3DPrintingHub.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MaterialTypeController : ControllerBase
{
    private readonly IMaterialTypeService _materialTypeService;

    public MaterialTypeController(IMaterialTypeService materialTypeService)
    {
        _materialTypeService = materialTypeService;
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] MaterialTypeCreateDto dto, CancellationToken cancellationToken)
    {
        var id = await _materialTypeService.CreateMaterialTypeAsync(dto, cancellationToken);
        var location = $"/api/materialtypes/{id}";
        return Created(location, new { id });
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var materialTypes = await _materialTypeService.GetAllMaterialTypesAsync(cancellationToken);
        return Ok(materialTypes);
    }
}
