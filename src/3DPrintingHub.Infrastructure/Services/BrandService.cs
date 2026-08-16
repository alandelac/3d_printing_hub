using _3DPrintingHub.Application.Dtos;
using _3DPrintingHub.Application.Services;
using _3DPrintingHub.Domain.Entities;
using _3DPrintingHub.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace _3DPrintingHub.Infrastructure.Services;

public class BrandService(ApplicationDbContext dbContext) : IBrandService
{
    public Task<Guid> CreateBrandAsync(BrandCreateDto dto, CancellationToken cancellationToken = default)
    {
        Brand brand = new()
        {
            Name = dto.Name
        };

        // Verify that the brand name is unique before adding it to the database
        var existingBrand = dbContext.Brands.FirstOrDefault(b => b.Name == brand.Name);
        if (existingBrand != null)
        {
            throw new InvalidOperationException("A brand with the same name already exists.");
        }

        dbContext.Brands.Add(brand);
        dbContext.SaveChanges();

        return Task.FromResult(brand.Id);
    }

    public Task<IEnumerable<BrandDto>> GetAllBrandsAsync(CancellationToken cancellationToken = default)
    {
        var brands = dbContext.Brands
            .Select(b => new BrandDto
            {
                Id = b.Id,
                Name = b.Name
            }).OrderBy(b => b.Name)
            .ToList();

        return Task.FromResult<IEnumerable<BrandDto>>(brands);
    }

    public Task<Guid> UpdateBrandAsync(BrandUpdateDto dto, CancellationToken cancellationToken = default)
    {
        var brand = dbContext.Brands.FirstOrDefault(b => b.Id == dto.Id)
            ?? throw new InvalidOperationException($"Brand with ID {dto.Id} does not exist.");

        var existing = dbContext.Brands.FirstOrDefault(b => b.Name == dto.Name && b.Id != dto.Id);
        if (existing != null)
        {
            throw new InvalidOperationException("A brand with the same name already exists.");
        }

        brand.Name = dto.Name;
        dbContext.SaveChanges();

        return Task.FromResult(brand.Id);
    }

    public Task DeleteBrandAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var brand = dbContext.Brands.FirstOrDefault(b => b.Id == id)
            ?? throw new InvalidOperationException($"Brand with ID {id} does not exist.");

        dbContext.Brands.Remove(brand);
        try
        {
            dbContext.SaveChanges();
        }
        catch (DbUpdateException)
        {
            throw new InvalidOperationException("This brand cannot be deleted because it is in use by another record.");
        }

        return Task.CompletedTask;
    }
}

