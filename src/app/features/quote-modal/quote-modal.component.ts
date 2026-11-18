import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuoteService } from '../../core/services/quote.service';
import { NailService, NailComplexity } from '../../core/models/service.model';
import { QuoteCalculationResult } from '../../core/models/quote.model';
import { NotificationService } from '../../core/services/notification.service';

export type BookingMode = 'domicilio' | 'press-on';

@Component({
  selector: 'app-quote-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './quote-modal.component.html',
  styleUrls: ['./quote-modal.component.scss']
})
export class QuoteModalComponent implements OnInit {
  private quoteService = inject(QuoteService);
  private notificationService = inject(NotificationService);

  // Modo de cotización: Cita a Domicilio o Set Press-On
  bookingMode = this.quoteService.activeBookingMode;

  @Input() set preselectedServiceId(id: string | null) {
    if (id) {
      if (id === 'press-on') {
        this.quoteService.setBookingMode('press-on');
      } else {
        this.quoteService.setBookingMode('domicilio');
        this.selectedServiceId = id;
        this.recalculate();
      }
    }
  }

  @Input() set initialNotes(val: string | null | undefined) {
    if (val) {
      this.notes = val;
    }
  }

  // --- MODO DOMICILIO ---
  services: NailService[] = [];
  complexityLevels: NailComplexity[] = [];

  selectedServiceId = 'mani-semi';
  selectedComplexityId: 'basic' | 'moderate' | 'complex' = 'basic';
  selectedNeighborhood = 'Usaquén';
  customNeighborhood = '';
  clientName = '';
  notes = '';
  referenceImageName = '';
  referenceImageBase64 = '';

  popularNeighborhoods = [
    'Usaquén',
    'Chapinero',
    'Suba',
    'Teusaquillo',
    'Cedritos',
    'Chicó',
    'Otro barrio'
  ];

  quoteResult: QuoteCalculationResult = {
    basePrice: 50000,
    extraPrice: 0,
    totalEstimated: 50000,
    depositAmount: 10000,
    balanceRemaining: 40000,
    durationText: 'Aprox. 2h'
  };

  // --- MODO PRESS-ON ---
  shapes = [
    { id: 'almond', label: 'Almendra' },
    { id: 'coffin', label: 'Coffin / Ballerina' },
    { id: 'stiletto', label: 'Stiletto / Punta' },
    { id: 'square', label: 'Cuadrada Clásica' }
  ];

  lengths = ['Corto', 'Medio', 'Largo', 'XL'];

  sizes = [
    { id: 'S', label: 'Talla S (Pequeña)', dims: '14mm, 11mm, 12mm, 10mm, 8mm' },
    { id: 'M', label: 'Talla M (Estándar)', dims: '15mm, 12mm, 13mm, 11mm, 8mm' },
    { id: 'L', label: 'Talla L (Grande)', dims: '16mm, 13mm, 14mm, 12mm, 9mm' },
    { id: 'custom', label: 'Medida Personalizada', dims: 'Indicar medidas exactas' }
  ];

  pressOnData = {
    shape: 'almond',
    length: 'Medio',
    size: 'M',
    city: 'Bogotá',
    theme: '',
    clientName: ''
  };

  showSizeGuide = false;

  ngOnInit() {
    this.services = this.quoteService.getServices();
    this.complexityLevels = this.quoteService.getComplexityLevels();
    this.recalculate();
  }

  setMode(mode: BookingMode) {
    this.quoteService.setBookingMode(mode);
  }

  selectService(id: string) {
    this.selectedServiceId = id;
    this.recalculate();
  }

  selectComplexity(id: 'basic' | 'moderate' | 'complex') {
    this.selectedComplexityId = id;
    this.recalculate();
  }

  selectNeighborhood(nh: string) {
    this.selectedNeighborhood = nh;
  }

  recalculate() {
    this.quoteResult = this.quoteService.calculateQuote(
      this.selectedServiceId,
      this.selectedComplexityId
    );
  }

  get currentServiceName(): string {
    const s = this.services.find(x => x.id === this.selectedServiceId);
    return s?.name || 'Manicura Semipermanente';
  }

  get currentComplexityTitle(): string {
    const c = this.complexityLevels.find(x => x.id === this.selectedComplexityId);
    return c?.title || 'Diseño Básico';
  }

  toggleSizeGuide() {
    this.showSizeGuide = !this.showSizeGuide;
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      if (file.size > 5 * 1024 * 1024) {
        this.notificationService.showWarning(
          'Archivo pesado',
          'La foto de referencia debe pesar menos de 5MB.'
        );
        return;
      }
      this.referenceImageName = file.name;
      const reader = new FileReader();
      reader.onload = (e) => {
        this.referenceImageBase64 = e.target?.result as string;
        this.notificationService.showSuccess(
          'Foto adjunta',
          'Referencia de diseño cargada con éxito.'
        );
      };
      reader.readAsDataURL(file);
    }
  }

  removeImage() {
    this.referenceImageName = '';
    this.referenceImageBase64 = '';
  }

  formatPrice(val: number): string {
    return this.quoteService.formatCurrency(val);
  }

  sendAvailabilityQuery() {
    const finalNeighborhood = this.selectedNeighborhood === 'Otro barrio' && this.customNeighborhood.trim()
      ? this.customNeighborhood.trim()
      : this.selectedNeighborhood;

    const url = this.quoteService.generateAvailabilityWhatsAppUrl(
      this.currentServiceName,
      this.currentComplexityTitle,
      this.formatPrice(this.quoteResult.totalEstimated),
      finalNeighborhood,
      this.clientName,
      this.notes
    );

    this.notificationService.showSuccess(
      'Abriendo WhatsApp',
      'Te redirigimos al chat con Yeye para consultar disponibilidad...'
    );

    window.open(url, '_blank');
  }

  sendPressOnOrder() {
    const shapeLabel = this.shapes.find(s => s.id === this.pressOnData.shape)?.label || this.pressOnData.shape;
    const url = this.quoteService.generatePressOnWhatsAppUrl(
      shapeLabel,
      this.pressOnData.length,
      this.pressOnData.size,
      this.pressOnData.city,
      this.pressOnData.clientName,
      this.pressOnData.theme
    );

    this.notificationService.showSuccess(
      'Abriendo WhatsApp',
      'Te redirigimos al chat para encargar tu set Press-On...'
    );

    window.open(url, '_blank');
  }
}