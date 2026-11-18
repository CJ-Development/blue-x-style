export interface PressOnOrder {
  clientName: string;
  clientPhone: string;
  city: string;
  shippingAddress: string;
  shape: 'Almendra' | 'Coffin' | 'Stiletto' | 'Cuadrada';
  length: 'Corta' | 'Mediana' | 'Larga' | 'Extra Larga';
  sizePreset: 'XS (14, 10, 11, 10, 8 mm)' | 'S (15, 11, 12, 11, 9 mm)' | 'M (16, 12, 13, 12, 10 mm)' | 'L (17, 13, 14, 13, 11 mm)' | 'A Medida' | string;
  theme: string;
  notes?: string;
  referenceImageBase64?: string;
  basePrice: number;
}
