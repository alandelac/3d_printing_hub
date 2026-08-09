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
    /// Adjusts the remaining weight of a Filament by adding or reducing the specified amount of grams.
    /// If the resulting weight is less than 0, it will be set to 0.
    /// </summary>
    /// <param name="filamentId">The Id of the Filament to adjust.</param>
    /// <param name="grams">The amount of grams to add (positive) or reduce (negative). Must be a whole number.</param>
    /// <param name="cancellationToken"></param>
    /// <returns>The updated FilamentDto.</returns>
    Task<FilamentDto> AdjustFilamentWeightAsync(Guid filamentId, int grams, CancellationToken cancellationToken = default);
}
