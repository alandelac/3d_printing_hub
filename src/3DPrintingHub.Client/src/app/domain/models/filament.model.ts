export interface FilamentProfileObject {
  id: string;
  brandId: string;
  brandName: string;
  materialTypeId: string;
  materialTypeName: string;
  ironingFlowPercentage?: number;
  ironingSpeedMmS?: number;
  slopeAngleForSupports?: number;
  zSeparationForSupports?: number;
}

export interface Filament {
  id: string;
  filamentProfileId: string;
  filamentProfile: FilamentProfileObject;
  filamentColorId: string;
  colorName: string;
  colorCode: string;
  remainingWeightGrams: number;
  minCost: number;
  maxCost: number;
  lastCost: number;
  lastPurchaseDate: string;
  buyLink?: string;
  buyAgain?: boolean;
}

export interface FilamentCreate {
  filamentProfileId: string;
  filamentColorId: string;
  minCost: number;
  maxCost: number;
  lastCost: number;
  buyAgain?: boolean;
  buyLink?: string;
  lastPurchaseDate?: string;
  remainingWeightGrams?: number;
}

export interface FilamentUpdate {
  id: string;
  remainingWeightGrams?: number;
  minCost?: number;
  maxCost?: number;
  lastCost?: number;
  lastPurchaseDate?: string;
  buyLink?: string;
  buyAgain?: boolean;
}
