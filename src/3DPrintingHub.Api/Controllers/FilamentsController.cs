using Microsoft.AspNetCore.Mvc;
using _3DPrintingHub.Application.Dtos;
using _3DPrintingHub.Application.Services;

namespace _3DPrintingHub.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FilamentsController : ControllerBase
{
    private readonly IFilamentService _filamentService;

    public FilamentsController(IFilamentService filamentService)
    {
        _filamentService = filamentService;
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] FilamentCreateDto dto, CancellationToken cancellationToken)
    {
        var id = await _filamentService.CreateFilamentAsync(dto, cancellationToken);

        var location = $"/api/filaments/{id}";
        return Created(location, new { id });
    }
}
