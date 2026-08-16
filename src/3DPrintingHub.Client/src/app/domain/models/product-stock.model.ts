export interface ProductStock {
  id: string;
  modelPrintId: string;
  modelPrintName: string;
  filamentId: string;
  filamentColorName: string;
  filamentColorCode: string;
  quantityInStock: number;
  costToProduce: number;
  recommendedSalePrice: number;
  salePrice: number;
  lastUpdated: string;
}

export interface ProductStockCreate {
  modelPrintId: string;
  filamentId: string;
  quantityInStock: number;
  salePrice: number;
}

export interface ProductStockUpdate {
  id: string;
  modelPrintId?: string;
  filamentId?: string;
  quantityInStock?: number;
  salePrice?: number;
}
