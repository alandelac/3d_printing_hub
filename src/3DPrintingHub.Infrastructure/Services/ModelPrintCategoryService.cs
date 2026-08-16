using System.Threading;
using System.Threading.Tasks;
using _3DPrintingHub.Application.Dtos;
using _3DPrintingHub.Application.Services;
using _3DPrintingHub.Domain.Entities;
using _3DPrintingHub.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

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

    public Task<Guid> UpdateModelPrintCategoryAsync(ModelPrintCategoryUpdateDto dto, CancellationToken cancellationToken = default)
    {
        var category = dbContext.ModelPrintCategories.FirstOrDefault(c => c.Id == dto.Id)
            ?? throw new InvalidOperationException($"Model print category with ID {dto.Id} does not exist.");

        var existing = dbContext.ModelPrintCategories.FirstOrDefault(c => c.Name == dto.Name && c.Id != dto.Id);
        if (existing != null)
        {
            throw new InvalidOperationException("A model print category with the same name already exists.");
        }

        category.Name = dto.Name;
        dbContext.SaveChanges();

        return Task.FromResult(category.Id);
    }

    public Task DeleteModelPrintCategoryAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var category = dbContext.ModelPrintCategories.FirstOrDefault(c => c.Id == id)
            ?? throw new InvalidOperationException($"Model print category with ID {id} does not exist.");

        dbContext.ModelPrintCategories.Remove(category);
        try
        {
            dbContext.SaveChanges();
        }
        catch (DbUpdateException)
        {
            throw new InvalidOperationException("This category cannot be deleted because it is in use by another record.");
        }

        return Task.CompletedTask;
    }
}
