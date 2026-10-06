export interface PrintJob {
  id: string;
  modelPrintId: string;
  modelPrintName?: string | null;
  filamentId: string;
  filamentName?: string | null;
  producedQuantity: number;
  usedWeightGrams: number;
  printedAt: string;
  calculatedMaterialCost: number;
  notes?: string | null;
}

export type PrintJobCreate = {
  modelPrintId: string;
  filamentId: string;
  producedQuantity: number;
  usedWeightGrams: number;
  printedAt?: string;
  notes?: string | null;
};
