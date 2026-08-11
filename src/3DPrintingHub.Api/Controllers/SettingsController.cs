using Microsoft.AspNetCore.Mvc;
using _3DPrintingHub.Application.Dtos;
using _3DPrintingHub.Application.Services;

namespace _3DPrintingHub.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SettingsController(ISettingService settingService) : ControllerBase
{
    /// <summary>
    /// Creates a new Setting.
    /// </summary>
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] SettingCreateDto dto, CancellationToken cancellationToken)
    {
        var id = await settingService.CreateSettingAsync(dto, cancellationToken);
        var location = $"/api/settings/{id}";
        return Created(location, new { id });
    }

    /// <summary>
    /// Retrieves all Settings.
    /// </summary>
    [HttpGet]
    public async Task<IActionResult> GetAll(CancellationToken cancellationToken)
    {
        var settings = await settingService.GetAllSettingsAsync(cancellationToken);
        return Ok(settings);
    }

    /// <summary>
    /// Retrieves a Setting by its Id.
    /// </summary>
    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetById(Guid id, CancellationToken cancellationToken)
    {
        var setting = await settingService.GetSettingByIdAsync(id, cancellationToken);

        if (setting == null)
        {
            return NotFound();
        }

        return Ok(setting);
    }

    /// <summary>
    /// Retrieves a Setting by its parameter name.
    /// </summary>
    [HttpGet("by-parameter/{parameter}")]
    public async Task<IActionResult> GetByParameter(string parameter, CancellationToken cancellationToken)
    {
        var setting = await settingService.GetSettingByParameterAsync(parameter, cancellationToken);

        if (setting == null)
        {
            return NotFound();
        }

        return Ok(setting);
    }

    /// <summary>
    /// Updates an existing Setting by its Id.
    /// </summary>
    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] SettingCreateDto dto, CancellationToken cancellationToken)
    {
        var updatedSetting = await settingService.UpdateSettingAsync(id, dto, cancellationToken);
        return Ok(updatedSetting);
    }

    /// <summary>
    /// Deletes a Setting by its Id.
    /// </summary>
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        var deleted = await settingService.DeleteSettingAsync(id, cancellationToken);

        if (!deleted)
        {
            return NotFound();
        }

        return NoContent();
    }
}
