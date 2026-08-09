using _3DPrintingHub.Application.Dtos;
using _3DPrintingHub.Application.Services;
using _3DPrintingHub.Domain.Entities;
using _3DPrintingHub.Infrastructure.Data;

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
}

