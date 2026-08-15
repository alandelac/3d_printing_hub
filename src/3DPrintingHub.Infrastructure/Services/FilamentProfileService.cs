using System.Threading;
using System.Threading.Tasks;
using _3DPrintingHub.Application.Dtos;
using _3DPrintingHub.Application.Services;
using _3DPrintingHub.Domain.Entities;
using _3DPrintingHub.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace _3DPrintingHub.Infrastructure.Services;

public class FilamentProfileService(ApplicationDbContext dbContext) : IFilamentProfileService
{

    public async Task<Guid> CreateFilamentProfileAsync(FilamentProfileCreateDto dto, CancellationToken cancellationToken = default)
    {
        Console.WriteLine($"Creating filament profile with BrandId: {dto.BrandId}, MaterialTypeId: {dto.MaterialTypeId}");

        // Validate that the BrandId exists
        var brand = await dbContext.Brands.FirstOrDefaultAsync(b => b.Id == dto.BrandId, cancellationToken) ?? throw new InvalidOperationException($"Brand with ID {dto.BrandId} does not exist.");
        Console.WriteLine($"Found brand: {brand.Name}");

        // Validate that the MaterialTypeId exists
        var materialType = await dbContext.MaterialTypes.FirstOrDefaultAsync(mt => mt.Id == dto.MaterialTypeId, cancellationToken) ?? throw new InvalidOperationException($"Material type with ID {dto.MaterialTypeId} does not exist.");
        Console.WriteLine($"Found material type: {materialType.Name}");

        // Check if a profile with this Brand + Material Type combination already exists
        var existingProfile = await dbContext.FilamentProfiles
            .FirstOrDefaultAsync(fp => fp.BrandId == dto.BrandId && fp.MaterialTypeId == dto.MaterialTypeId, cancellationToken);

        if (existingProfile != null)
        {
            throw new InvalidOperationException(
                $"A filament profile for brand '{brand.Name}' and material type '{materialType.Name}' already exists. " +
                $"Please edit the existing profile instead of creating a new one.");
        }

        var filamentProfile = new FilamentProfile
        {
            BrandId = dto.BrandId,
            MaterialTypeId = dto.MaterialTypeId,
            IroningFlowPercentage = dto.IroningFlowPercentage,
            IroningSpeedMmS = dto.IroningSpeedMmS,
            SlopeAngleForSupports = dto.SlopeAngleForSupports,
            ZSeparationForSupports = dto.ZSeparationForSupports
        };

        await dbContext.FilamentProfiles.AddAsync(filamentProfile, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);

        Console.WriteLine($"Created filament profile with ID: {filamentProfile.Id}");
        return filamentProfile.Id;
    }

    public async Task<IEnumerable<FilamentProfileDto>> GetAllFilamentProfilesAsync(CancellationToken cancellationToken = default)
    {
        // First, get all filament profiles
        var filamentProfiles = await dbContext.FilamentProfiles
            .ToListAsync(cancellationToken);

        // Get all brands and material types
        var allBrands = await dbContext.Brands.ToListAsync(cancellationToken);
        var allMaterialTypes = await dbContext.MaterialTypes.ToListAsync(cancellationToken);

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
        }).OrderBy(fp => fp.BrandName)
        .ThenBy(fp => fp.MaterialTypeName)
        .ToList();

        return result;
    }

    public async Task<Guid> UpdateFilamentProfileAsync(FilamentProfileUpdateDto dto, CancellationToken cancellationToken = default)
    {
        var filamentProfile = await dbContext.FilamentProfiles
            .FirstOrDefaultAsync(fp => fp.Id == dto.Id, cancellationToken)
            ?? throw new InvalidOperationException($"Filament profile with ID {dto.Id} does not exist.");

        // Validate that the BrandId exists
        var brand = await dbContext.Brands.FirstOrDefaultAsync(b => b.Id == dto.BrandId, cancellationToken)
            ?? throw new InvalidOperationException($"Brand with ID {dto.BrandId} does not exist.");

        // Validate that the MaterialTypeId exists
        var materialType = await dbContext.MaterialTypes.FirstOrDefaultAsync(mt => mt.Id == dto.MaterialTypeId, cancellationToken)
            ?? throw new InvalidOperationException($"Material type with ID {dto.MaterialTypeId} does not exist.");

        // Check if another profile with this Brand + Material Type combination already exists
        var conflictingProfile = await dbContext.FilamentProfiles
            .FirstOrDefaultAsync(fp => fp.Id != dto.Id && fp.BrandId == dto.BrandId && fp.MaterialTypeId == dto.MaterialTypeId, cancellationToken);

        if (conflictingProfile != null)
        {
            throw new InvalidOperationException(
                $"A filament profile for brand '{brand.Name}' and material type '{materialType.Name}' already exists.");
        }

        filamentProfile.BrandId = dto.BrandId;
        filamentProfile.MaterialTypeId = dto.MaterialTypeId;
        filamentProfile.IroningFlowPercentage = dto.IroningFlowPercentage;
        filamentProfile.IroningSpeedMmS = dto.IroningSpeedMmS;
        filamentProfile.SlopeAngleForSupports = dto.SlopeAngleForSupports;
        filamentProfile.ZSeparationForSupports = dto.ZSeparationForSupports;

        await dbContext.SaveChangesAsync(cancellationToken);

        Console.WriteLine($"Updated filament profile with ID: {filamentProfile.Id}");
        return filamentProfile.Id;
    }
}
