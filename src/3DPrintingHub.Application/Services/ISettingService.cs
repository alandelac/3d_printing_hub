using System.Threading;
using System.Threading.Tasks;
using _3DPrintingHub.Application.Dtos;

namespace _3DPrintingHub.Application.Services;

public interface ISettingService
{
    /// <summary>
    /// Creates a new Setting record and returns its Id.
    /// </summary>
    Task<Guid> CreateSettingAsync(SettingCreateDto dto, CancellationToken cancellationToken = default);

    /// <summary>
    /// Retrieves all Setting records.
    /// </summary>
    Task<IEnumerable<SettingDto>> GetAllSettingsAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Retrieves a Setting by its Id.
    /// </summary>
    Task<SettingDto?> GetSettingByIdAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Retrieves a Setting by its parameter name.
    /// </summary>
    Task<SettingDto?> GetSettingByParameterAsync(string parameter, CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates an existing Setting by its Id.
    /// </summary>
    Task<SettingDto> UpdateSettingAsync(Guid id, SettingCreateDto dto, CancellationToken cancellationToken = default);

    /// <summary>
    /// Deletes a Setting record by its Id.
    /// </summary>
    Task<bool> DeleteSettingAsync(Guid id, CancellationToken cancellationToken = default);
}
