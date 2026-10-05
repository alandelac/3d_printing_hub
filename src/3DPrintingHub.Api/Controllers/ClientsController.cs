using _3DPrintingHub.Application.Dtos;
using _3DPrintingHub.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace _3DPrintingHub.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ClientsController(IClientService clientService) : ControllerBase
{
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] ClientCreateDto dto, CancellationToken cancellationToken)
    {
        var id = await clientService.CreateClientAsync(dto, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id }, new { id });
    }

    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var clients = await clientService.GetAllClientsAsync(cancellationToken);
        return Ok(clients);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        var client = await clientService.GetClientByIdAsync(id, cancellationToken);
        return Ok(client);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] ClientUpdateDto dto, CancellationToken cancellationToken)
    {
        if (id != dto.Id)
        {
            return BadRequest("The route id does not match the id in the request body.");
        }

        var updatedClient = await clientService.UpdateClientAsync(dto, cancellationToken);
        return Ok(updatedClient);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Archive(Guid id, CancellationToken cancellationToken)
    {
        await clientService.ArchiveClientAsync(id, cancellationToken);
        return NoContent();
    }
}
