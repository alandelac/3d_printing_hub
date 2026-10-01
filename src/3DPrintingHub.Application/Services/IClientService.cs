using _3DPrintingHub.Application.Dtos;

namespace _3DPrintingHub.Application.Services;

public interface IClientService
{
    /// <summary>
    /// Creates a new Client record and returns its Id.
    /// </summary>
    Task<Guid> CreateClientAsync(ClientCreateDto dto, CancellationToken cancellationToken = default);

    /// <summary>
    /// Retrieves all Client records in a stable order.
    /// </summary>
    Task<IEnumerable<ClientDto>> GetAllClientsAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Retrieves a Client record by Id.
    /// </summary>
    Task<ClientDto> GetClientByIdAsync(Guid id, CancellationToken cancellationToken = default);

    /// <summary>
    /// Updates an existing Client record and returns the updated record.
    /// </summary>
    Task<ClientDto> UpdateClientAsync(ClientUpdateDto dto, CancellationToken cancellationToken = default);
}
