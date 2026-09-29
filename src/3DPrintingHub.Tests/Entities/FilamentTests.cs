using _3DPrintingHub.Domain.Entities;
using _3DPrintingHub.Domain.Exceptions;

namespace _3DPrintingHub.Tests.Entities;

public class FilamentTests
{
    [Fact]
    public void AdjustRemainingWeight_WhenAddedIncreasesWeightAndLogsAuditEntry()
    {
        var filament = new Filament { RemainingWeightGrams = 250 };

        filament.AdjustRemainingWeight(50m, "Restock");

        Assert.Equal(300, filament.RemainingWeightGrams);
        Assert.NotEmpty(filament.WeightAdjustmentLogs);
        Assert.Equal("Restock", filament.WeightAdjustmentLogs.Single().Reason);
    }

    [Fact]
    public void AdjustRemainingWeight_WhenSubtractedDecreasesWeight()
    {
        var filament = new Filament { RemainingWeightGrams = 250 };

        filament.AdjustRemainingWeight(-75m, "Used in print");

        Assert.Equal(175, filament.RemainingWeightGrams);
    }

    [Fact]
    public void AdjustRemainingWeight_WhenResultIsZero_AllowsBoundaryValue()
    {
        var filament = new Filament { RemainingWeightGrams = 100 };

        filament.AdjustRemainingWeight(-100m, "Consumed all spool");

        Assert.Equal(0, filament.RemainingWeightGrams);
    }

    [Fact]
    public void AdjustRemainingWeight_WhenResultWouldBeNegative_ThrowsBusinessRuleException()
    {
        var filament = new Filament { RemainingWeightGrams = 100 };

        var exception = Assert.Throws<BusinessRuleException>(() => filament.AdjustRemainingWeight(-150m, "Overdrawn spool"));

        Assert.Contains("negative", exception.Message, StringComparison.OrdinalIgnoreCase);
    }
}
