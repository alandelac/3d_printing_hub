using System.Threading;
using System.Threading.Tasks;
using _3DPrintingHub.Application.Dtos;
using _3DPrintingHub.Application.Services;
using _3DPrintingHub.Domain.Entities;
using _3DPrintingHub.Infrastructure.Data;

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
            .ToList();

        return Task.FromResult<IEnumerable<MaterialTypeDto>>(materialTypes);
    }
}