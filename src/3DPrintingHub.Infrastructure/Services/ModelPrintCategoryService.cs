using System.Threading;
using System.Threading.Tasks;
using _3DPrintingHub.Application.Dtos;
using _3DPrintingHub.Application.Services;
using _3DPrintingHub.Domain.Entities;
using _3DPrintingHub.Infrastructure.Data;

namespace _3DPrintingHub.Infrastructure.Services;

public class ModelPrintCategoryService(ApplicationDbContext dbContext) : IModelPrintCategoryService
{
    public Task<Guid> CreateModelPrintCategoryAsync(ModelPrintCategoryCreateDto dto, CancellationToken cancellationToken = default)
    {
        ModelPrintCategory category = new()
        {
            Name = dto.Name
        };

        // Verify that the category name is unique before adding it to the database
        var existingCategory = dbContext.ModelPrintCategories.FirstOrDefault(c => c.Name == category.Name);
        if (existingCategory != null)
        {
            throw new InvalidOperationException("A model print category with the same name already exists.");
        }

        dbContext.ModelPrintCategories.Add(category);
        dbContext.SaveChanges();

        return Task.FromResult(category.Id);
    }

    public Task<IEnumerable<ModelPrintCategoryDto>> GetAllModelPrintCategoriesAsync(CancellationToken cancellationToken = default)
    {
        var categories = dbContext.ModelPrintCategories
            .Select(c => new ModelPrintCategoryDto
            {
                Id = c.Id,
                Name = c.Name
            })
            .OrderBy(c => c.Name)
            .ToList();

        return Task.FromResult<IEnumerable<ModelPrintCategoryDto>>(categories);
    }
}
