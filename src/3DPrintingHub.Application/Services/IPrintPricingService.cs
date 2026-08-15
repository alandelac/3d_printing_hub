using _3DPrintingHub.Application.Dtos;

namespace _3DPrintingHub.Application.Services;

/// <summary>
/// Calculates ModelPrint production costs and sale prices from the configured
/// cost settings and the current average filament price.
/// </summary>
public interface IPrintPricingService
{
    /// <summary>
    /// Loads the configured cost settings and the current average filament price.
    /// </summary>
    Task<PricingInputs> GetPricingInputsAsync(CancellationToken cancellationToken = default);

    /// <summary>
    /// Computes the production cost and the sale price (cost * 2) for a print.
    /// </summary>
    (decimal Cost, decimal SalePrice) CalculateCostAndSalePrice(int grams, int minutes, PricingInputs inputs);

    /// <summary>
    /// Computes the production cost for a print using the price of a specific filament
    /// (its MaxCost per kg) instead of the average of all filaments.
    /// </summary>
    Task<decimal> CalculateCostUsingFilamentAsync(int grams, int minutes, decimal filamentMaxCost, CancellationToken cancellationToken = default);

    /// <summary>
    /// Recomputes DefaultCost and DefaultSalePrice for every ModelPrint using the current
    /// average filament price and the configured cost settings. Returns the number of updated ModelPrints.
    /// </summary>
    Task<int> RecalculateAllModelPrintCostsAsync(CancellationToken cancellationToken = default);
}
