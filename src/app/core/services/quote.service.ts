import { Injectable, inject, signal } from '@angular/core';
import { COMPLEXITY_LEVELS, NAIL_SERVICES, NailComplexity, NailService } from '../models/service.model';
import { QuoteCalculationResult } from '../models/quote.model';
import { CatalogService } from './catalog.service';

@Injectable({
  providedIn: 'root'
})
export class QuoteService {
  private catalogService = inject(CatalogService);

  // WhatsApp oficial de Yeye
  readonly contactPhone = '573125278094';

  // Modo activo global para el cotizador express
  activeBookingMode = signal<'domicilio' | 'press-on'>('domicilio');

  setBookingMode(mode: 'domicilio' | 'press-on') {
    this.activeBookingMode.set(mode);
  }

  getServices(): NailService[] {
    return this.catalogService.services();
  }

  getServiceById(id: string): NailService | undefined {
    return this.catalogService.getServiceById(id);
  }

  getComplexityLevels(): NailComplexity[] {
    return COMPLEXITY_LEVELS;
  }

  getComplexityById(id: string): NailComplexity | undefined {
    return COMPLEXITY_LEVELS.find(c => c.id === id);
  }

  calculateQuote(serviceId: string, complexityId: 'basic' | 'moderate' | 'complex'): QuoteCalculationResult {
    const service = this.getServiceById(serviceId) || NAIL_SERVICES[2];
    const complexity = this.getComplexityById(complexityId) || COMPLEXITY_LEVELS[0];

    const basePrice = service.basePrice;
    const extraPrice = complexity.extraPrice;
    const totalEstimated = basePrice + extraPrice;
    const depositAmount = Math.round(totalEstimated * 0.20);
    const balanceRemaining = totalEstimated - depositAmount;

    let durationText = service.durationEstimate;
    if (complexity.extraTimeMinutes > 0) {
      durationText = `${service.durationEstimate} + ~${complexity.extraTimeMinutes}min por diseño`;
    }

    return {
      basePrice,
      extraPrice,
      totalEstimated,
      depositAmount,
      balanceRemaining,
      durationText
    };
  }

  formatCurrency(value: number): string {
    const rounded = Math.round(value || 0);
    const formatted = rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `$${formatted} COP`;
  }

  generateAvailabilityWhatsAppUrl(
    serviceName: string,
    complexityTitle: string,
    totalPrice: string,
    neighborhood: string,
    clientName?: string,
    notes?: string
  ): string {
    const lines: string[] = [
      '*SOLICITUD DE DISPONIBILIDAD - CITA A DOMICILIO*',
      '-----------------------------------------',
      `• *Servicio:* ${serviceName}`,
      `• *Estilo de diseño:* ${complexityTitle}`,
      `• *Cotización estimada:* ${totalPrice}`
    ];

    if (neighborhood?.trim()) {
      lines.push(`• *Sector/Barrio en Bogotá:* ${neighborhood.trim()}`);
    }
    if (clientName?.trim()) {
      lines.push(`• *Cliente:* ${clientName.trim()}`);
    }
    if (notes?.trim()) {
      lines.push(`• *Detalle o idea:* ${notes.trim()}`);
    }

    lines.push('-----------------------------------------');
    lines.push('¡Hola Yeye! Deseo saber qué fechas u horarios tienes disponibles esta semana para este servicio a domicilio. ¡Quedo atenta/o!');

    return `https://api.whatsapp.com/send?phone=${this.contactPhone}&text=${encodeURIComponent(lines.join('\n'))}`;
  }

  generatePressOnWhatsAppUrl(
    shape: string,
    length: string,
    size: string,
    city: string,
    clientName?: string,
    theme?: string
  ): string {
    const lines: string[] = [
      '*PEDIDO SET PRESS-ON NAILS - BLUE X STYLE*',
      '-----------------------------------------',
      `• *Forma de uña:* ${shape}`,
      `• *Largo:* ${length}`,
      `• *Talla:* ${size}`,
      `• *Inversión base:* $40.000 COP`
    ];

    if (city?.trim()) {
      lines.push(`• *Ciudad de envío:* ${city.trim()}`);
    }
    if (theme?.trim()) {
      lines.push(`• *Temática / Idea:* ${theme.trim()}`);
    }
    if (clientName?.trim()) {
      lines.push(`• *Cliente:* ${clientName.trim()}`);
    }

    lines.push('-----------------------------------------');
    lines.push('¡Hola Yeye! Quiero encargar este set personalizado de Press-On Nails. ¿Cómo coordinamos el diseño final y el método de pago? ¡Gracias!');

    return `https://api.whatsapp.com/send?phone=${this.contactPhone}&text=${encodeURIComponent(lines.join('\n'))}`;
  }
}