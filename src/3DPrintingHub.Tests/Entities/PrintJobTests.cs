using _3DPrintingHub.Domain.Entities;

namespace _3DPrintingHub.Tests.Entities;

public class PrintJobTests
{
    [Fact]
    public void PrintJob_WhenCreated_StoresExpectedValues()
    {
        var filamentId = Guid.NewGuid();
        var modelPrintId = Guid.NewGuid();

        var printJob = new PrintJob
        {
            FilamentId = filamentId,
            ModelPrintId = modelPrintId,
            UsedWeightGrams = 250m,
            ProducedQuantity = 12,
            PrintedAt = new DateTime(2026, 10, 5, 12, 30, 0, DateTimeKind.Utc),
            CalculatedMaterialCost = 4.50m,
            Notes = "First batch"
        };

        Assert.NotEqual(Guid.Empty, printJob.Id);
        Assert.Equal(filamentId, printJob.FilamentId);
        Assert.Equal(modelPrintId, printJob.ModelPrintId);
        Assert.Equal(250m, printJob.UsedWeightGrams);
        Assert.Equal(12, printJob.ProducedQuantity);
        Assert.Equal(4.50m, printJob.CalculatedMaterialCost);
        Assert.Equal("First batch", printJob.Notes);
    }
}
