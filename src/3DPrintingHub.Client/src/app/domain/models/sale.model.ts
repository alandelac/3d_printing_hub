export interface Sale {
  id: string;
  productStockId: string;
  clientId?: string | null;
  clientName?: string | null;
  quantity: number;
  salePrice: number;
  paymentReceived: boolean;
  soldAtUtc: string;
}

export type SaleCreate = {
  productStockId: string;
  clientId?: string | null;
  quantity: number;
  salePrice: number;
  paymentReceived: boolean;
};

export type SaleUpdate = Sale;
