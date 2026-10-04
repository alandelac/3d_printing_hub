using _3DPrintingHub.Application.Dtos;

namespace _3DPrintingHub.Application.Services;

public interface IFilamentService
{
    /// <summary>
    /// Creates a new Filament record and returns its Id.
    /// </summary>
    Task<Guid> CreateFilamentAsync(FilamentCreateDto dto, CancellationToken cancellationToken = default);

    /// <summary>
    /// Retrieves all Filament records with their profile and color information.
    /// </summary>
    Task<IEnumerable<FilamentDto>> GetAllFilamentsAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Deletes a Filament record by its Id and returns the deleted Filament data.
    /// </summary>
    Task<FilamentDto> DeleteFilamentAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates a Filament record by its Id with the provided fields and returns the updated Filament data.
    /// </summary>
    Task<FilamentDto> UpdateFilamentAsync(FilamentUpdateDto dto, CancellationToken cancellationToken = default);

    /// <summary>
    /// Adjusts the remaining weight of a Filament by adding or reducing the specified amount.
    /// A negative resulting weight is rejected, and the adjustment is tracked in the audit log.
    /// </summary>
    /// <param name="filamentId">The Id of the Filament to adjust.</param>
    /// <param name="amount">The amount of grams to add (positive) or reduce (negative).</param>
    /// <param name="reason">The reason for the adjustment.</param>
    /// <param name="userId">The user performing the adjustment.</param>
    /// <param name="cancellationToken"></param>
    /// <returns>The updated FilamentDto.</returns>
    Task<FilamentDto> AdjustFilamentWeightAsync(Guid filamentId, decimal amount, string? reason = null, string? userId = null, CancellationToken cancellationToken = default);
}
