namespace _3DPrintingHub.Application.Dtos;

/// <summary>
/// Holds the pricing settings and the average filament price used to compute ModelPrint costs.
/// </summary>
public readonly record struct PricingInputs(
    decimal AvgMaxPrice,
    decimal MisprintRatio,
    decimal ElectricityPricePerKwh,
    decimal PrinterConsumptionWatts,
    decimal TeardownPricePerHour);
