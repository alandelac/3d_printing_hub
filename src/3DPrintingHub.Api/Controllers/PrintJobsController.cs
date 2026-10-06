using _3DPrintingHub.Application.Dtos;
using _3DPrintingHub.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace _3DPrintingHub.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class PrintJobsController(IPrintJobService printJobService) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] PrintJobCreateDto dto, CancellationToken cancellationToken)
    {
        var id = await printJobService.CreatePrintJobAsync(dto, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id }, new { id });
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var jobs = await printJobService.GetPrintJobsAsync(cancellationToken);
        return Ok(jobs);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        var job = await printJobService.GetPrintJobByIdAsync(id, cancellationToken);
        return Ok(job);
    }
}
