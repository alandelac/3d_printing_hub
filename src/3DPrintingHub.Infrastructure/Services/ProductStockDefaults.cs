using _3DPrintingHub.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace _3DPrintingHub.Infrastructure.Services;

internal static class ProductStockDefaults
{
    private const string MinimumInventoryParameter = "minimum_inventory_quantity";

    public static async Task<int> GetMinimumInventoryQuantityAsync(
        ApplicationDbContext dbContext,
        CancellationToken cancellationToken)
    {
        var setting = await dbContext.Settings
            .AsNoTracking()
            .FirstOrDefaultAsync(setting => setting.parameter == MinimumInventoryParameter, cancellationToken)
            ?? throw new InvalidOperationException($"Setting '{MinimumInventoryParameter}' is not configured.");

        if (setting.value < 0 || setting.value > int.MaxValue || decimal.Truncate(setting.value) != setting.value)
        {
            throw new InvalidOperationException($"Setting '{MinimumInventoryParameter}' must be a non-negative integer.");
        }

        return decimal.ToInt32(setting.value);
    }
}