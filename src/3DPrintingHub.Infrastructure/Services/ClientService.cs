using _3DPrintingHub.Application.Dtos;
using _3DPrintingHub.Application.Exceptions;
using _3DPrintingHub.Application.Services;
using _3DPrintingHub.Domain.Entities;
using _3DPrintingHub.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace _3DPrintingHub.Infrastructure.Services;

public class ClientService(ApplicationDbContext dbContext) : IClientService
{
    public async Task<Guid> CreateClientAsync(ClientCreateDto dto, CancellationToken cancellationToken = default)
    {
        var client = new Client
        {
            Name = dto.Name.Trim(),
            ContactPlatform = dto.ContactPlatform,
            IsArchived = false,
            Phone = NormalizeOptional(dto.Phone),
            Email = NormalizeOptional(dto.Email)
        };

        await dbContext.Clients.AddAsync(client, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);

        return client.Id;
    }

    public async Task<IEnumerable<ClientDto>> GetAllClientsAsync(CancellationToken cancellationToken = default)
    {
        return await dbContext.Clients
            .AsNoTracking()
            .Where(c => !c.IsArchived)
            .OrderBy(c => c.Name)
            .ThenBy(c => c.Id)
            .Select(c => new ClientDto
            {
                Id = c.Id,
                Name = c.Name,
                ContactPlatform = c.ContactPlatform,
                IsArchived = c.IsArchived,
                Phone = c.Phone,
                Email = c.Email
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<ClientDto> GetClientByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var client = await dbContext.Clients
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == id, cancellationToken)
            ?? throw new ResourceNotFoundException($"Client with ID {id} was not found.");

        return MapToDto(client);
    }

    public async Task<ClientDto> UpdateClientAsync(ClientUpdateDto dto, CancellationToken cancellationToken = default)
    {
        var client = await dbContext.Clients
            .FirstOrDefaultAsync(c => c.Id == dto.Id, cancellationToken)
            ?? throw new ResourceNotFoundException($"Client with ID {dto.Id} was not found.");

        client.Name = dto.Name.Trim();
        client.ContactPlatform = dto.ContactPlatform;
        client.Phone = NormalizeOptional(dto.Phone);
        client.Email = NormalizeOptional(dto.Email);

        await dbContext.SaveChangesAsync(cancellationToken);

        return MapToDto(client);
    }

    public async Task ArchiveClientAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var client = await dbContext.Clients
            .FirstOrDefaultAsync(c => c.Id == id, cancellationToken)
            ?? throw new ResourceNotFoundException($"Client with ID {id} was not found.");

        if (client.IsArchived)
        {
            return;
        }

        client.IsArchived = true;
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    private static ClientDto MapToDto(Client client) => new()
    {
        Id = client.Id,
        Name = client.Name,
        ContactPlatform = client.ContactPlatform,
        IsArchived = client.IsArchived,
        Phone = client.Phone,
        Email = client.Email
    };

    private static string? NormalizeOptional(string? value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return null;
        }

        return value.Trim();
    }
}
