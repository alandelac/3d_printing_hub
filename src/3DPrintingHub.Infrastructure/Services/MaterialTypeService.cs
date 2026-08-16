using System.Threading;
using System.Threading.Tasks;
using _3DPrintingHub.Application.Dtos;
using _3DPrintingHub.Application.Services;
using _3DPrintingHub.Domain.Entities;
using _3DPrintingHub.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace _3DPrintingHub.Infrastructure.Services;

public class MaterialTypeService(ApplicationDbContext dbContext) : IMaterialTypeService
{
    public Task<Guid> CreateMaterialTypeAsync(MaterialTypeCreateDto dto, CancellationToken cancellationToken = default)
    {
        MaterialType materialType = new()
        {
            Name = dto.Name
        };

        // Verify that the material type name is unique before adding it to the database
        var existingType = dbContext.MaterialTypes.FirstOrDefault(mt => mt.Name == materialType.Name);
        if (existingType != null)
        {
            throw new InvalidOperationException("A material type with the same name already exists.");
        }

        dbContext.MaterialTypes.Add(materialType);
        dbContext.SaveChanges();

        return Task.FromResult(materialType.Id);
    }

    public Task<IEnumerable<MaterialTypeDto>> GetAllMaterialTypesAsync(CancellationToken cancellationToken = default)
    {
        var materialTypes = dbContext.MaterialTypes
            .Select(mt => new MaterialTypeDto
            {
                Id = mt.Id,
                Name = mt.Name
            })
            .OrderBy(mt => mt.Name)
            .ToList();

        return Task.FromResult<IEnumerable<MaterialTypeDto>>(materialTypes);
    }

    public Task<Guid> UpdateMaterialTypeAsync(MaterialTypeUpdateDto dto, CancellationToken cancellationToken = default)
    {
        var materialType = dbContext.MaterialTypes.FirstOrDefault(mt => mt.Id == dto.Id)
            ?? throw new InvalidOperationException($"Material type with ID {dto.Id} does not exist.");

        var existing = dbContext.MaterialTypes.FirstOrDefault(mt => mt.Name == dto.Name && mt.Id != dto.Id);
        if (existing != null)
        {
            throw new InvalidOperationException("A material type with the same name already exists.");
        }

        materialType.Name = dto.Name;
        dbContext.SaveChanges();

        return Task.FromResult(materialType.Id);
    }

    public Task DeleteMaterialTypeAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var materialType = dbContext.MaterialTypes.FirstOrDefault(mt => mt.Id == id)
            ?? throw new InvalidOperationException($"Material type with ID {id} does not exist.");

        dbContext.MaterialTypes.Remove(materialType);
        try
        {
            dbContext.SaveChanges();
        }
        catch (DbUpdateException)
        {
            throw new InvalidOperationException("This material type cannot be deleted because it is in use by another record.");
        }

        return Task.CompletedTask;
    }
}