using System.Threading;
using System.Threading.Tasks;
using _3DPrintingHub.Application.Dtos;
using _3DPrintingHub.Application.Services;
using _3DPrintingHub.Domain.Entities;
using _3DPrintingHub.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace _3DPrintingHub.Infrastructure.Services;

public class FilamentColorService(ApplicationDbContext dbContext) : IFilamentColorService
{
    public Task<Guid> CreateFilamentColorAsync(FilamentColorCreateDto dto, CancellationToken cancellationToken = default)
    {
        FilamentColor filamentColor = new()
        {
            Name = dto.Color,
            ColorCode = dto.ColorCode // Assuming the color code is the same as the name for now
        };

        // Verify that the color code is unique before adding it to the database
        var existingColor = dbContext.FilamentColors.FirstOrDefault(fc => fc.Name == filamentColor.Name);
        if (existingColor != null)
        {
            throw new InvalidOperationException("A filament color with the same name already exists.");
        }

        dbContext.FilamentColors.Add(filamentColor);
        dbContext.SaveChanges();

        return Task.FromResult(filamentColor.Id);
    }

    public Task<IEnumerable<FilamentColorDto>> GetAllFilamentColorsAsync(CancellationToken cancellationToken = default)
    {
        var filamentColors = dbContext.FilamentColors
            .Select(fc => new FilamentColorDto
            {
                Id = fc.Id,
                Color = fc.Name,
                ColorCode = fc.ColorCode
            }).OrderBy(fc => fc.Color)
            .ToList();

        return Task.FromResult<IEnumerable<FilamentColorDto>>(filamentColors);
    }

    public Task<Guid> UpdateFilamentColorAsync(FilamentColorUpdateDto dto, CancellationToken cancellationToken = default)
    {
        var filamentColor = dbContext.FilamentColors.FirstOrDefault(fc => fc.Id == dto.Id)
            ?? throw new InvalidOperationException($"Filament color with ID {dto.Id} does not exist.");

        var existing = dbContext.FilamentColors.FirstOrDefault(fc => fc.Name == dto.Color && fc.Id != dto.Id);
        if (existing != null)
        {
            throw new InvalidOperationException("A filament color with the same name already exists.");
        }

        filamentColor.Name = dto.Color;
        filamentColor.ColorCode = dto.ColorCode;
        dbContext.SaveChanges();

        return Task.FromResult(filamentColor.Id);
    }

    public Task DeleteFilamentColorAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var filamentColor = dbContext.FilamentColors.FirstOrDefault(fc => fc.Id == id)
            ?? throw new InvalidOperationException($"Filament color with ID {id} does not exist.");

        dbContext.FilamentColors.Remove(filamentColor);
        try
        {
            dbContext.SaveChanges();
        }
        catch (DbUpdateException)
        {
            throw new InvalidOperationException("This filament color cannot be deleted because it is in use by another record.");
        }

        return Task.CompletedTask;
    }
}
