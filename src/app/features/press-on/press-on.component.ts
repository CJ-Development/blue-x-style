import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../core/services/supabase.service';
import { PressOnOrder } from '../../core/models/press-on.model';
import { QuoteService } from '../../core/services/quote.service';
import { NotificationService } from '../../core/services/notification.service';

export type PressOnShape = 'Almendra' | 'Coffin' | 'Stiletto' | 'Cuadrada';
export type PressOnLength = 'Corta' | 'Mediana' | 'Larga' | 'Extra Larga';

export interface SizePresetOption {
  id: string;
  label: string;
  dims: string;
  description: string;
  highlight?: boolean;
}

@Component({
  selector: 'app-press-on',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './press-on.component.html',
  styleUrls: ['./press-on.component.scss']
})
export class PressOnComponent {
  private supabaseService = inject(SupabaseService);
  private quoteService = inject(QuoteService);
  private notificationService = inject(NotificationService);

  hasAttemptedSubmit = false;

  shapes: { id: PressOnShape; label: string }[] = [
    { id: 'Almendra', label: 'Almendra' },
    { id: 'Coffin', label: 'Coffin / Ballerina' },
    { id: 'Stiletto', label: 'Stiletto / Punta' },
    { id: 'Cuadrada', label: 'Cuadrada Clásica' }
  ];

  lengths: PressOnLength[] = ['Corta', 'Mediana', 'Larga', 'Extra Larga'];

  sizes: SizePresetOption[] = [
    { 
      id: 'XS (14, 10, 11, 10, 8 mm)', 
      label: 'XS', 
      dims: '14, 10, 11, 10, 8 mm',
      description: 'Para dedos muy finos o lecho ungueal pequeño'
    },
    { 
      id: 'S (15, 11, 12, 11, 9 mm)', 
      label: 'S', 
      dims: '15, 11, 12, 11, 9 mm',
      description: 'Dedos delgados estándar'
    },
    { 
      id: 'M (16, 12, 13, 12, 10 mm)', 
      label: 'M', 
      dims: '16, 12, 13, 12, 10 mm',
      description: 'Talla estándar más común',
      highlight: true
    },
    { 
      id: 'L (17, 13, 14, 13, 11 mm)', 
      label: 'L', 
      dims: '17, 13, 14, 13, 11 mm',
      description: 'Dedos anchos o lecho amplio'
    },
    { 
      id: 'Personalizada', 
      label: 'A Medida', 
      dims: 'Tus mm exactos dedo por dedo',
      description: 'Ingresa los mm de cada dedo o te asesoramos'
    }
  ];

  customMeasurements = {
    thumb: '',
    index: '',
    middle: '',
    ring: '',
    pinky: ''
  };

  showSizeGuide = false;
  isSubmitting = false;
  orderSent = false;

  orderData: PressOnOrder = {
    clientName: '',
    clientPhone: '',
    city: 'Medellín',
    shippingAddress: '',
    shape: 'Almendra',
    length: 'Mediana',
    sizePreset: 'M (16, 12, 13, 12, 10 mm)',
    theme: 'Colección Y2K Chrome / Personalizado',
    notes: '',
    basePrice: 40000
  };

  setShape(shape: PressOnShape) {
    this.orderData.shape = shape;
  }

  setLength(length: PressOnLength) {
    this.orderData.length = length;
  }

  setSize(sizeId: string) {
    this.orderData.sizePreset = sizeId;
  }

  toggleSizeGuide() {
    this.showSizeGuide = !this.showSizeGuide;
  }

  goToCotizador() {
    this.quoteService.setBookingMode('press-on');
    const el = document.getElementById('cotizador');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }

  async sendPressOnOrder() {
    this.hasAttemptedSubmit = true;

    const missingFields: string[] = [];
    if (!this.orderData.clientName?.trim()) missingFields.push('Nombre');
    if (!this.orderData.clientPhone?.trim()) missingFields.push('WhatsApp');
    if (!this.orderData.shippingAddress?.trim()) missingFields.push('Dirección de entrega');

    if (missingFields.length > 0) {
      this.notificationService.showWarning(
        'Faltan datos de envío',
        `Por favor completa: ${missingFields.join(', ')} para preparar el envío de tus Press-On.`
      );
      return;
    }

    this.isSubmitting = true;

    // Si es personalizado, adjuntar milímetros
    let customNote = '';
    if (this.orderData.sizePreset === 'A Medida') {
      const { thumb, index, middle, ring, pinky } = this.customMeasurements;
      customNote = `[Medidas mm: Pulgar=${thumb || 's/d'}, Índice=${index || 's/d'}, Medio=${middle || 's/d'}, Anular=${ring || 's/d'}, Meñique=${pinky || 's/d'}]`;
    }

    const payload = {
      ...this.orderData,
      notes: [this.orderData.notes, customNote].filter(Boolean).join(' - ')
    };

    await this.supabaseService.savePressOnOrder(payload);

    const message = `*PEDIDO PRESS-ON NAILS - BLUE X STYLE*
-----------------------------------------
• *Cliente:* ${this.orderData.clientName}
• *Teléfono:* ${this.orderData.clientPhone}
• *Ciudad:* ${this.orderData.city}
• *Dirección de Envío:* ${this.orderData.shippingAddress}

• *Forma de Uña:* ${this.orderData.shape}
• *Largo:* ${this.orderData.length}
• *Talla Seleccionada:* ${this.orderData.sizePreset}
${customNote ? `• *Medidas por dedo:* ${customNote}` : ''}
• *Temática / Idea:* ${this.orderData.theme}
${this.orderData.notes ? `• *Detalles:* ${this.orderData.notes}` : ''}

• *Precio Base:* ${this.quoteService.formatCurrency(this.orderData.basePrice)} (sujeto a cotización por diseño)
-----------------------------------------
¡Hola Yeye! Deseo cotizar y ordenar este set de Press On Nails. Te comparto mis medidas y foto de referencia por aquí.`;

    const url = `https://api.whatsapp.com/send?phone=${this.quoteService.contactPhone}&text=${encodeURIComponent(message)}`;
    this.isSubmitting = false;
    this.orderSent = true;
    this.notificationService.showSuccess(
      '¡Pedido preparado!',
      'Abriendo WhatsApp para coordinar los detalles con Yeye...'
    );
    window.open(url, '_blank');
  }
}
