using _3DPrintingHub.Application.Dtos;
using _3DPrintingHub.Application.Services;
using _3DPrintingHub.Domain.Entities;
using _3DPrintingHub.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace _3DPrintingHub.Infrastructure.Services;

public class FilamentService(
    ApplicationDbContext dbContext,
    IModelPrintService modelPrintService) : IFilamentService
{

    public async Task<Guid> CreateFilamentAsync(FilamentCreateDto dto, CancellationToken cancellationToken = default)
    {
        // Validate that the FilamentProfileId exists
        var profile = await dbContext.FilamentProfiles
            .FirstOrDefaultAsync(fp => fp.Id == dto.FilamentProfileId, cancellationToken) ?? throw new InvalidOperationException($"Filament profile with ID {dto.FilamentProfileId} does not exist.");

        // Validate that the FilamentColorId exists
        var color = await dbContext.FilamentColors
            .FirstOrDefaultAsync(fc => fc.Id == dto.FilamentColorId, cancellationToken) ?? throw new InvalidOperationException($"Filament color with ID {dto.FilamentColorId} does not exist.");

        var lastPurchaseDate = dto.LastPurchaseDate.HasValue
            ? DateTime.SpecifyKind(dto.LastPurchaseDate.Value, DateTimeKind.Utc)
            : DateTime.UtcNow;

        var filament = new Filament
        {
            FilamentProfileId = dto.FilamentProfileId,
            FilamentColorId = dto.FilamentColorId,
            MinCost = dto.MinCost,
            MaxCost = dto.MaxCost,
            LastCost = dto.LastCost,
            BuyAgain = dto.BuyAgain,
            BuyLink = dto.BuyLink,
            LastPurchaseDate = lastPurchaseDate,
            RemainingWeightGrams = dto.RemainingWeightGrams ?? 1000
        };

        await dbContext.Filaments.AddAsync(filament, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);

        // Adding a filament changes the average filament price,
        // so keep ModelPrint costs and prices in sync.
        await modelPrintService.RecalculateAllModelPrintCostsAsync(cancellationToken);

        return filament.Id;
    }

    public async Task<IEnumerable<FilamentDto>> GetAllFilamentsAsync(CancellationToken cancellationToken = default)
    {
        var filaments = await dbContext.Filaments
            .Include(f => f.Profile)
                .ThenInclude(p => p!.BrandName)
            .Include(f => f.Profile)
                .ThenInclude(p => p!.MaterialType)
            .Include(f => f.Color)
            .ToListAsync(cancellationToken);

        var allBrands = await dbContext.Brands.ToListAsync(cancellationToken);
        var allMaterialTypes = await dbContext.MaterialTypes.ToListAsync(cancellationToken);

        var brandLookup = allBrands.ToDictionary(b => b.Id, b => b.Name);
        var materialTypeLookup = allMaterialTypes.ToDictionary(mt => mt.Id, mt => mt.Name);

        var result = filaments.Select(f => new FilamentDto
        {
            Id = f.Id,
            FilamentProfileId = f.FilamentProfileId,
            FilamentProfile = new FilamentProfileDto
            {
                Id = f.Profile!.Id,
                BrandId = f.Profile.BrandId,
                BrandName = brandLookup.TryGetValue(f.Profile.BrandId, out var brandName) ? brandName : $"Unknown Brand ({f.Profile.BrandId})",
                MaterialTypeId = f.Profile.MaterialTypeId,
                MaterialTypeName = materialTypeLookup.TryGetValue(f.Profile.MaterialTypeId, out var mtName) ? mtName : $"Unknown Material ({f.Profile.MaterialTypeId})",
                IroningFlowPercentage = f.Profile.IroningFlowPercentage,
                IroningSpeedMmS = f.Profile.IroningSpeedMmS,
                SlopeAngleForSupports = f.Profile.SlopeAngleForSupports,
                ZSeparationForSupports = f.Profile.ZSeparationForSupports
            },
            FilamentColorId = f.FilamentColorId,
            ColorName = f.Color != null ? f.Color.Name : $"Unknown Color ({f.FilamentColorId})",
            ColorCode = f.Color != null ? f.Color.ColorCode : string.Empty,
            RemainingWeightGrams = f.RemainingWeightGrams,
            MinCost = f.MinCost,
            MaxCost = f.MaxCost,
            LastCost = f.LastCost,
            LastPurchaseDate = f.LastPurchaseDate,
            BuyLink = f.BuyLink,
            BuyAgain = f.BuyAgain
        }).OrderBy(f => f.FilamentProfile.BrandName)
        .ThenBy(f => f.FilamentProfile.MaterialTypeName)
        .ThenBy(f => f.ColorName)
        .ToList();

        return result;
    }

    public async Task<FilamentDto> DeleteFilamentAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var filament = await dbContext.Filaments
            .Include(f => f.Profile)
                .ThenInclude(p => p!.BrandName)
            .Include(f => f.Profile)
                .ThenInclude(p => p!.MaterialType)
            .Include(f => f.Color)
            .FirstOrDefaultAsync(f => f.Id == id, cancellationToken)
            ?? throw new InvalidOperationException($"Filament with ID {id} does not exist.");

        var allBrands = await dbContext.Brands.ToListAsync(cancellationToken);
        var allMaterialTypes = await dbContext.MaterialTypes.ToListAsync(cancellationToken);

        var brandLookup = allBrands.ToDictionary(b => b.Id, b => b.Name);
        var materialTypeLookup = allMaterialTypes.ToDictionary(mt => mt.Id, mt => mt.Name);

        var deletedDto = new FilamentDto
        {
            Id = filament.Id,
            FilamentProfileId = filament.FilamentProfileId,
            FilamentProfile = new FilamentProfileDto
            {
                Id = filament.Profile!.Id,
                BrandId = filament.Profile.BrandId,
                BrandName = brandLookup.TryGetValue(filament.Profile.BrandId, out var brandName) ? brandName : $"Unknown Brand ({filament.Profile.BrandId})",
                MaterialTypeId = filament.Profile.MaterialTypeId,
                MaterialTypeName = materialTypeLookup.TryGetValue(filament.Profile.MaterialTypeId, out var mtName) ? mtName : $"Unknown Material ({filament.Profile.MaterialTypeId})",
                IroningFlowPercentage = filament.Profile.IroningFlowPercentage,
                IroningSpeedMmS = filament.Profile.IroningSpeedMmS,
                SlopeAngleForSupports = filament.Profile.SlopeAngleForSupports,
                ZSeparationForSupports = filament.Profile.ZSeparationForSupports
            },
            FilamentColorId = filament.FilamentColorId,
            ColorName = filament.Color != null ? filament.Color.Name : $"Unknown Color ({filament.FilamentColorId})",
            ColorCode = filament.Color != null ? filament.Color.ColorCode : string.Empty,
            RemainingWeightGrams = filament.RemainingWeightGrams,
            MinCost = filament.MinCost,
            MaxCost = filament.MaxCost,
            LastCost = filament.LastCost,
            LastPurchaseDate = filament.LastPurchaseDate,
            BuyLink = filament.BuyLink,
            BuyAgain = filament.BuyAgain
        };

        dbContext.Filaments.Remove(filament);
        await dbContext.SaveChangesAsync(cancellationToken);

        // Deleting a filament also changes the average filament price,
        // so keep ModelPrint costs and prices in sync.
        await modelPrintService.RecalculateAllModelPrintCostsAsync(cancellationToken);

        return deletedDto;
    }

    public async Task<FilamentDto> UpdateFilamentAsync(FilamentUpdateDto dto, CancellationToken cancellationToken = default)
    {
        var filament = await dbContext.Filaments
            .Include(f => f.Profile)
                .ThenInclude(p => p!.BrandName)
            .Include(f => f.Profile)
                .ThenInclude(p => p!.MaterialType)
            .Include(f => f.Color)
            .FirstOrDefaultAsync(f => f.Id == dto.Id, cancellationToken)
            ?? throw new InvalidOperationException($"Filament with ID {dto.Id} does not exist.");

        var maxCostChanged = false;

        if (dto.RemainingWeightGrams.HasValue)
        {
            filament.RemainingWeightGrams = dto.RemainingWeightGrams.Value;
        }

        if (dto.MinCost.HasValue)
        {
            filament.MinCost = dto.MinCost.Value;
        }

        if (dto.MaxCost.HasValue && dto.MaxCost.Value != filament.MaxCost)
        {
            filament.MaxCost = dto.MaxCost.Value;
            maxCostChanged = true;
        }

        if (dto.LastCost.HasValue)
        {
            filament.LastCost = dto.LastCost.Value;
        }

        if (dto.LastPurchaseDate.HasValue)
        {
            filament.LastPurchaseDate = DateTime.SpecifyKind(dto.LastPurchaseDate.Value, DateTimeKind.Utc);
        }

        if (dto.BuyLink is not null)
        {
            filament.BuyLink = dto.BuyLink;
        }

        if (dto.BuyAgain.HasValue)
        {
            filament.BuyAgain = dto.BuyAgain.Value;
        }

        await dbContext.SaveChangesAsync(cancellationToken);

        // If the max price changed, the average filament price changed too,
        // so keep ModelPrint costs and prices in sync.
        if (maxCostChanged)
        {
            await modelPrintService.RecalculateAllModelPrintCostsAsync(cancellationToken);
        }

        var allBrands = await dbContext.Brands.ToListAsync(cancellationToken);
        var allMaterialTypes = await dbContext.MaterialTypes.ToListAsync(cancellationToken);

        var brandLookup = allBrands.ToDictionary(b => b.Id, b => b.Name);
        var materialTypeLookup = allMaterialTypes.ToDictionary(mt => mt.Id, mt => mt.Name);

        return new FilamentDto
        {
            Id = filament.Id,
            FilamentProfileId = filament.FilamentProfileId,
            FilamentProfile = new FilamentProfileDto
            {
                Id = filament.Profile!.Id,
                BrandId = filament.Profile.BrandId,
                BrandName = brandLookup.TryGetValue(filament.Profile.BrandId, out var brandName) ? brandName : $"Unknown Brand ({filament.Profile.BrandId})",
                MaterialTypeId = filament.Profile.MaterialTypeId,
                MaterialTypeName = materialTypeLookup.TryGetValue(filament.Profile.MaterialTypeId, out var mtName) ? mtName : $"Unknown Material ({filament.Profile.MaterialTypeId})",
                IroningFlowPercentage = filament.Profile.IroningFlowPercentage,
                IroningSpeedMmS = filament.Profile.IroningSpeedMmS,
                SlopeAngleForSupports = filament.Profile.SlopeAngleForSupports,
                ZSeparationForSupports = filament.Profile.ZSeparationForSupports
            },
            FilamentColorId = filament.FilamentColorId,
            ColorName = filament.Color != null ? filament.Color.Name : $"Unknown Color ({filament.FilamentColorId})",
            ColorCode = filament.Color != null ? filament.Color.ColorCode : string.Empty,
            RemainingWeightGrams = filament.RemainingWeightGrams,
            MinCost = filament.MinCost,
            MaxCost = filament.MaxCost,
            LastCost = filament.LastCost,
            LastPurchaseDate = filament.LastPurchaseDate,
            BuyLink = filament.BuyLink,
            BuyAgain = filament.BuyAgain
        };
    }

    public async Task<FilamentDto> AdjustFilamentWeightAsync(Guid filamentId, int grams, CancellationToken cancellationToken = default)
    {
        var filament = await dbContext.Filaments
            .Include(f => f.Profile)
                .ThenInclude(p => p!.BrandName)
            .Include(f => f.Profile)
                .ThenInclude(p => p!.MaterialType)
            .Include(f => f.Color)
            .FirstOrDefaultAsync(f => f.Id == filamentId, cancellationToken)
            ?? throw new InvalidOperationException($"Filament with ID {filamentId} does not exist.");

        filament.RemainingWeightGrams = Math.Max(0, filament.RemainingWeightGrams + grams);

        await dbContext.SaveChangesAsync(cancellationToken);

        var allBrands = await dbContext.Brands.ToListAsync(cancellationToken);
        var allMaterialTypes = await dbContext.MaterialTypes.ToListAsync(cancellationToken);

        var brandLookup = allBrands.ToDictionary(b => b.Id, b => b.Name);
        var materialTypeLookup = allMaterialTypes.ToDictionary(mt => mt.Id, mt => mt.Name);

        return new FilamentDto
        {
            Id = filament.Id,
            FilamentProfileId = filament.FilamentProfileId,
            FilamentProfile = new FilamentProfileDto
            {
                Id = filament.Profile!.Id,
                BrandId = filament.Profile.BrandId,
                BrandName = brandLookup.TryGetValue(filament.Profile.BrandId, out var brandName) ? brandName : $"Unknown Brand ({filament.Profile.BrandId})",
                MaterialTypeId = filament.Profile.MaterialTypeId,
                MaterialTypeName = materialTypeLookup.TryGetValue(filament.Profile.MaterialTypeId, out var mtName) ? mtName : $"Unknown Material ({filament.Profile.MaterialTypeId})",
                IroningFlowPercentage = filament.Profile.IroningFlowPercentage,
                IroningSpeedMmS = filament.Profile.IroningSpeedMmS,
                SlopeAngleForSupports = filament.Profile.SlopeAngleForSupports,
                ZSeparationForSupports = filament.Profile.ZSeparationForSupports
            },
            FilamentColorId = filament.FilamentColorId,
            ColorName = filament.Color != null ? filament.Color.Name : $"Unknown Color ({filament.FilamentColorId})",
            ColorCode = filament.Color != null ? filament.Color.ColorCode : string.Empty,
            RemainingWeightGrams = filament.RemainingWeightGrams,
            MinCost = filament.MinCost,
            MaxCost = filament.MaxCost,
            LastCost = filament.LastCost,
            LastPurchaseDate = filament.LastPurchaseDate,
            BuyLink = filament.BuyLink,
            BuyAgain = filament.BuyAgain
        };
    }
}
