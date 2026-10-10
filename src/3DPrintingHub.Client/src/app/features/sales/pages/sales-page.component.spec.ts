import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ClientRepository } from '../../../data/repositories/client.repository';
import { ProductStockRepository } from '../../../data/repositories/product-stock.repository';
import { SaleRepository } from '../../../data/repositories/sale.repository';
import { Client, ClientContactPlatform } from '../../../domain/models/client.model';
import { ProductStock } from '../../../domain/models/product-stock.model';
import { Sale } from '../../../domain/models/sale.model';
import { SalesPageComponent } from './sales-page.component';

const clients: Client[] = [{
  id: 'c1',
  name: 'Ada Lovelace',
  contactPlatform: ClientContactPlatform.WhatsApp,
  phone: '+34 111 222 333',
  email: 'ada@example.com'
}];

const productStocks: ProductStock[] = [{
  id: 'p1',
  modelPrintId: 'm1',
  modelPrintName: 'Print A',
  filamentId: 'f1',
  filamentColorName: 'Red',
  filamentColorCode: '#f00',
  quantityInStock: 14,
  minimumInventoryQuantity: 2,
  costToProduce: 4,
  recommendedSalePrice: 8,
  salePrice: 10,
  lastUpdated: '2026-01-01T00:00:00Z'
}];

const sales: Sale[] = [{
  id: 's1',
  productStockId: 'p1',
  clientId: 'c1',
  clientName: 'Ada Lovelace',
  quantity: 2,
  salePrice: 10,
  paymentReceived: false,
  soldAtUtc: '2026-10-01T12:00:00Z'
}];

describe('SalesPageComponent', () => {
  let fixture: ComponentFixture<SalesPageComponent>;
  let getSales: ReturnType<typeof vi.fn>;
  let getClients: ReturnType<typeof vi.fn>;
  let getAllProductStocks: ReturnType<typeof vi.fn>;
  let createSale: ReturnType<typeof vi.fn>;
  let updateSale: ReturnType<typeof vi.fn>;

  const compiled = (): HTMLElement => fixture.nativeElement as HTMLElement;

  const flush = async (): Promise<void> => {
    await fixture.whenStable();
    fixture.detectChanges();
  };

  beforeEach(async () => {
    getSales = vi.fn().mockReturnValue(of(sales));
    getClients = vi.fn().mockReturnValue(of(clients));
    getAllProductStocks = vi.fn().mockReturnValue(of(productStocks));
    createSale = vi.fn().mockReturnValue(of({ id: 's2' }));
    updateSale = vi.fn().mockReturnValue(of({ ...sales[0], paymentReceived: true }));
    vi.stubGlobal('alert', vi.fn());

    await TestBed.configureTestingModule({
      imports: [SalesPageComponent],
      providers: [
        { provide: SaleRepository, useValue: { getSales, createSale, updateSale } },
        { provide: ClientRepository, useValue: { getClients } },
        { provide: ProductStockRepository, useValue: { getAllProductStocks } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SalesPageComponent);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('loads sales and renders the shared table', async () => {
    fixture.detectChanges();
    await flush();

    expect(getSales).toHaveBeenCalledTimes(1);
    expect(fixture.componentInstance['sales']()).toHaveLength(1);
    expect(fixture.componentInstance['sales']()[0].clientName).toBe('Ada Lovelace');
    expect(fixture.componentInstance['sales']()[0].paymentReceived).toBe(false);
  });

  it('creates a sale from the modal and validates required values', async () => {
    fixture.detectChanges();
    await flush();

    await (fixture.componentInstance as any).saveSale({
      productStockId: 'p1',
      clientId: 'c1',
      quantity: 3,
      salePrice: 12,
      paymentReceived: false
    });
    await flush();

    expect(createSale).toHaveBeenCalledWith({
      productStockId: 'p1',
      clientId: 'c1',
      quantity: 3,
      salePrice: 12,
      paymentReceived: false
    });
  });

  it('marks a sale as paid without deleting it', async () => {
    fixture.detectChanges();
    await flush();

    await (fixture.componentInstance as any).markPaid(sales[0]);
    await flush();

    expect(updateSale).toHaveBeenCalledWith({
      ...sales[0],
      paymentReceived: true
    });
    expect(fixture.componentInstance['sales']()[0].id).toBe('s1');
  });

  it('falls back to the empty state when there are no sales', async () => {
    getSales.mockReturnValue(of([]));

    fixture.detectChanges();
    await flush();

    expect(fixture.componentInstance['sales']()).toEqual([]);
  });

  it('skips mark-paid when the sale is already paid', async () => {
    fixture.detectChanges();
    await flush();

    await (fixture.componentInstance as any).markPaid({ ...sales[0], paymentReceived: true });
    await flush();

    expect(updateSale).not.toHaveBeenCalled();
  });

  it('validates quantity and price before saving', async () => {
    fixture.detectChanges();
    await flush();

    await (fixture.componentInstance as any).saveSale({
      productStockId: 'p1',
      clientId: 'c1',
      quantity: 0,
      salePrice: 0,
      paymentReceived: false
    });

    expect(fixture.componentInstance['validationError']()).toBe('Quantity must be greater than zero.');

    await (fixture.componentInstance as any).saveSale({
      productStockId: 'p1',
      clientId: 'c1',
      quantity: 2,
      salePrice: 0,
      paymentReceived: false
    });

    expect(fixture.componentInstance['validationError']()).toBe('Unit sale price must be greater than zero.');
  });

  it('updates an existing sale in edit mode', async () => {
    fixture.detectChanges();
    await flush();

    const instance = fixture.componentInstance as any;
    instance.editingSale.set(sales[0]);

    await instance.saveSale({
      productStockId: 'p1',
      clientId: 'c1',
      quantity: 4,
      salePrice: 9,
      paymentReceived: false
    });
    await flush();

    expect(updateSale).toHaveBeenCalledWith({
      ...sales[0],
      productStockId: 'p1',
      clientId: 'c1',
      quantity: 4,
      salePrice: 9,
      paymentReceived: false
    });
  });

  it('shows validation feedback when the sale input is invalid', async () => {
    fixture.detectChanges();
    await flush();

    await (fixture.componentInstance as any).saveSale({
      productStockId: '',
      clientId: 'c1',
      quantity: 1,
      salePrice: 10,
      paymentReceived: false
    });
    await flush();

    expect(fixture.componentInstance['validationError']()).toBe('Please select a product stock.');
  });

  it('alerts when loading sales fails', async () => {
    getSales.mockReturnValueOnce(throwError(() => new Error('Failed to load')));
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

    fixture.detectChanges();
    await flush();

    expect(alertSpy).toHaveBeenCalled();
  });
});
