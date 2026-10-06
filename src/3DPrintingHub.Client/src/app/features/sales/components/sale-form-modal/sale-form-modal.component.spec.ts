import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ClientContactPlatform } from '../../../../domain/models/client.model';
import { ProductStock } from '../../../../domain/models/product-stock.model';
import { Sale } from '../../../../domain/models/sale.model';
import { SaleFormModalComponent } from './sale-form-modal.component';

const productStocks: ProductStock[] = [
  {
    id: 'p1',
    modelPrintId: 'm1',
    modelPrintName: 'Print A',
    filamentId: 'f1',
    filamentColorName: 'Red',
    filamentColorCode: '#f00',
    quantityInStock: 14,
    costToProduce: 4,
    recommendedSalePrice: 8,
    salePrice: 10,
    lastUpdated: '2026-01-01T00:00:00Z'
  },
  {
    id: 'p2',
    modelPrintId: 'm2',
    modelPrintName: 'Print B',
    filamentId: 'f2',
    filamentColorName: 'Blue',
    filamentColorCode: '#00f',
    quantityInStock: 6,
    costToProduce: 5,
    recommendedSalePrice: 12,
    salePrice: 20,
    lastUpdated: '2026-01-01T00:00:00Z'
  }
];

const clients = [{
  id: 'c1',
  name: 'Ada Lovelace',
  contactPlatform: ClientContactPlatform.WhatsApp,
  phone: '+34 111 222 333',
  email: 'ada@example.com'
}];

describe('SaleFormModalComponent', () => {
  let fixture: ComponentFixture<SaleFormModalComponent>;
  let component: SaleFormModalComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SaleFormModalComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(SaleFormModalComponent);
    component = fixture.componentInstance;
    component.clients = clients;
    component.productStocks = productStocks;
  });

  it('initializes default values for create mode', () => {
    component.ngOnChanges();
    fixture.detectChanges();

    expect(component['productStockId']()).toBe('p1');
    expect(component['clientId']()).toBeNull();
    expect(component['quantity']()).toBe(1);
    expect(component['salePrice']()).toBe(10);
    expect(component['paymentReceived']()).toBe(false);
  });

  it('applies sale values for edit mode', () => {
    const sale: Sale = {
      id: 's1',
      productStockId: 'p2',
      clientId: 'c1',
      clientName: 'Ada Lovelace',
      quantity: 3,
      salePrice: 15,
      paymentReceived: true,
      soldAtUtc: '2026-10-01T12:00:00Z'
    };

    component.sale = sale;
    component.ngOnChanges();
    fixture.detectChanges();

    expect(component['productStockId']()).toBe('p2');
    expect(component['clientId']()).toBe('c1');
    expect(component['quantity']()).toBe(3);
    expect(component['salePrice']()).toBe(20);
    expect(component['paymentReceived']()).toBe(true);
  });

  it('updates the sale price when the selected stock changes', () => {
    component.ngOnChanges();
    fixture.detectChanges();

    component['onProductStockChange']('p2');

    expect(component['productStockId']()).toBe('p2');
    expect(component['salePrice']()).toBe(20);
  });

  it('emits a save payload with normalized values', () => {
    const saveSpy = vi.fn();
    component.save.subscribe(saveSpy);
    (component as any).productStockId.set('p1');
    (component as any).clientId.set('c1');
    (component as any).quantity.set(0);
    (component as any).salePrice.set(0);
    (component as any).paymentReceived.set(true);

    component['submit']();

    expect(saveSpy).toHaveBeenCalledWith({
      productStockId: 'p1',
      clientId: 'c1',
      quantity: 1,
      salePrice: 0,
      paymentReceived: true
    });
  });

  it('does not emit when no product stock is selected', () => {
    const saveSpy = vi.fn();
    component.save.subscribe(saveSpy);
    (component as any).productStockId.set('');
    (component as any).salePrice.set(0);
    (component as any).quantity.set(1);

    component['submit']();

    expect(saveSpy).not.toHaveBeenCalled();
  });
});
