using _3DPrintingHub.Application.Dtos;

namespace _3DPrintingHub.Application.Services;

public interface ISaleService
{
    Task<Guid> CreateSaleAsync(SaleCreateDto dto, CancellationToken cancellationToken = default);

    Task<IEnumerable<SaleDto>> GetSalesAsync(CancellationToken cancellationToken = default);

    Task<SaleDto> GetSaleByIdAsync(Guid id, CancellationToken cancellationToken = default);

    Task<SaleDto> UpdateSaleAsync(SaleUpdateDto dto, CancellationToken cancellationToken = default);
}
