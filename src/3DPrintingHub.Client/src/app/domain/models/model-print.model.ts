export interface ModelPrint {
  id: string;
  name: string;
  categoryId: string;
  categoryName: string;
  estimatedWeightGrams: number;
  estimatedTimeMinutes: number;
  commercialLicense: boolean;
  defaultSalePrice: number;
  defaultCost: number;
  fileLocationOrUrl?: string;
  notes?: string;
}

export interface ModelPrintCreate {
  name: string;
  categoryId: string;
  estimatedWeightGrams: number;
  estimatedTimeMinutes: number;
  fileLocationOrUrl?: string;
  notes?: string;
}

export interface ModelPrintUpdate {
  id: string;
  name?: string;
  categoryId?: string;
  estimatedWeightGrams?: number;
  estimatedTimeMinutes?: number;
  fileLocationOrUrl?: string;
  notes?: string;
}
