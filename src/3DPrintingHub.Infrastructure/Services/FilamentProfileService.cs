using System.Threading;
using System.Threading.Tasks;
using _3DPrintingHub.Application.Dtos;
using _3DPrintingHub.Application.Services;
using _3DPrintingHub.Domain.Entities;
using _3DPrintingHub.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace _3DPrintingHub.Infrastructure.Services;

public class FilamentProfileService : IFilamentProfileService
{
    private readonly ApplicationDbContext _dbContext;

    public FilamentProfileService(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<Guid> CreateFilamentProfileAsync(FilamentProfileCreateDto dto, CancellationToken cancellationToken = default)
    {
        Console.WriteLine($"Creating filament profile with BrandId: {dto.BrandId}, MaterialTypeId: {dto.MaterialTypeId}");

        // Validate that the BrandId exists
        var brand = await _dbContext.Brands.FirstOrDefaultAsync(b => b.Id == dto.BrandId, cancellationToken);
        if (brand == null)
        {
            throw new InvalidOperationException($"Brand with ID {dto.BrandId} does not exist.");
        }
        Console.WriteLine($"Found brand: {brand.Name}");

        // Validate that the MaterialTypeId exists
        var materialType = await _dbContext.MaterialTypes.FirstOrDefaultAsync(mt => mt.Id == dto.MaterialTypeId, cancellationToken);
        if (materialType == null)
        {
            throw new InvalidOperationException($"Material type with ID {dto.MaterialTypeId} does not exist.");
        }
        Console.WriteLine($"Found material type: {materialType.Name}");

        var filamentProfile = new FilamentProfile
        {
            BrandId = dto.BrandId,
            MaterialTypeId = dto.MaterialTypeId,
            IroningFlowPercentage = dto.IroningFlowPercentage,
            IroningSpeedMmS = dto.IroningSpeedMmS,
            SlopeAngleForSupports = dto.SlopeAngleForSupports,
            ZSeparationForSupports = dto.ZSeparationForSupports
        };

        await _dbContext.FilamentProfiles.AddAsync(filamentProfile, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);

        Console.WriteLine($"Created filament profile with ID: {filamentProfile.Id}");
        return filamentProfile.Id;
    }

    public async Task<IEnumerable<FilamentProfileDto>> GetAllFilamentProfilesAsync(CancellationToken cancellationToken = default)
    {
        // First, get all filament profiles
        var filamentProfiles = await _dbContext.FilamentProfiles
            .ToListAsync(cancellationToken);

        // Get all brands and material types
        var allBrands = await _dbContext.Brands.ToListAsync(cancellationToken);
        var allMaterialTypes = await _dbContext.MaterialTypes.ToListAsync(cancellationToken);

        // Create lookup dictionaries
        var brandLookup = allBrands.ToDictionary(b => b.Id, b => b.Name);
        var materialTypeLookup = allMaterialTypes.ToDictionary(mt => mt.Id, mt => mt.Name);

        // Map to DTOs
        var result = filamentProfiles.Select(fp => new FilamentProfileDto
        {
            Id = fp.Id,
            BrandId = fp.BrandId,
            BrandName = brandLookup.TryGetValue(fp.BrandId, out var brandName) ? brandName : $"Unknown Brand ({fp.BrandId})",
            MaterialTypeId = fp.MaterialTypeId,
            MaterialTypeName = materialTypeLookup.TryGetValue(fp.MaterialTypeId, out var mtName) ? mtName : $"Unknown Material ({fp.MaterialTypeId})",
            IroningFlowPercentage = fp.IroningFlowPercentage,
            IroningSpeedMmS = fp.IroningSpeedMmS,
            SlopeAngleForSupports = fp.SlopeAngleForSupports,
            ZSeparationForSupports = fp.ZSeparationForSupports
        }).ToList();

        return result;
    }
}
