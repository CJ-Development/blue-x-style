export interface QuoteBookingForm {
  clientName: string;
  clientPhone: string;
  address: string;
  neighborhood: string;
  serviceId: string;
  complexityId: 'basic' | 'moderate' | 'complex';
  preferredDate: string;
  preferredTimeSlot: string;
  notes: string;
  referenceImageName?: string;
  referenceImageBase64?: string;
}

export interface QuoteCalculationResult {
  basePrice: number;
  extraPrice: number;
  totalEstimated: number;
  depositAmount: number; // 20%
  balanceRemaining: number;
  durationText: string;
}
