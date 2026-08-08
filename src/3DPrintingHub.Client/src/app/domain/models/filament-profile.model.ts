export interface FilamentProfile {
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

export interface FilamentProfileCreate {
  materialTypeId: string;
  brandId: string;
  ironingFlowPercentage?: number;
  ironingSpeedMmS?: number;
  slopeAngleForSupports?: number;
  zSeparationForSupports?: number;
}
