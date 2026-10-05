using _3DPrintingHub.Domain.Entities;

namespace _3DPrintingHub.Tests.Entities;

public class ClientTests
{
    [Fact]
    public void Client_WhenCreatedWithValidData_StoresExpectedValues()
    {
        var client = new Client
        {
            Name = "Ada",
            ContactPlatform = ClientContactPlatform.WhatsApp,
            Phone = "+351912345678",
            Email = "ada@example.com"
        };

        Assert.NotEqual(Guid.Empty, client.Id);
        Assert.Equal("Ada", client.Name);
        Assert.Equal(ClientContactPlatform.WhatsApp, client.ContactPlatform);
        Assert.Equal("+351912345678", client.Phone);
        Assert.Equal("ada@example.com", client.Email);
        Assert.False(client.IsArchived);
    }

    [Theory]
    [InlineData(ClientContactPlatform.WhatsApp)]
    [InlineData(ClientContactPlatform.Facebook)]
    [InlineData(ClientContactPlatform.PhoneCall)]
    public void Client_AllSupportedContactPlatforms_AreAccepted(ClientContactPlatform platform)
    {
        var client = new Client
        {
            Name = "Test Client",
            ContactPlatform = platform
        };

        Assert.Equal(platform, client.ContactPlatform);
    }
}
