import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuoteService } from '../../core/services/quote.service';
import { NotificationService } from '../../core/services/notification.service';
import { CatalogService, CotizadorContent, PressOnShape } from '../../core/services/catalog.service';
import { FlyToCartService } from '../../core/services/fly-to-cart.service';
import { SplitTextComponent } from '../../shared/components/split-text/split-text.component';
import { OdometerComponent } from '../../shared/components/odometer/odometer.component';
import { MagneticDirective } from '../../shared/directives/magnetic.directive';
import { HoverImageRevealDirective } from '../../shared/directives/hover-image-reveal.directive';

@Component({
  selector: 'app-quote-modal',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    SplitTextComponent,
    OdometerComponent,
    MagneticDirective,
    HoverImageRevealDirective
  ],
  templateUrl: './quote-modal.component.html',
  styleUrls: ['./quote-modal.component.scss']
})
export class QuoteModalComponent {
  private quoteService = inject(QuoteService);
  private notificationService = inject(NotificationService);
  catalogService = inject(CatalogService);
  cartService = inject(FlyToCartService);

  @Input() set preselectedServiceId(_id: string | null) {
    // Mantenido por compatibilidad con rutas y eventos previos
  }

  @Input() set initialNotes(val: string | null | undefined) {
    if (val) {
      this.pressOnData.theme = val;
    }
  }

  get shapes(): PressOnShape[] {
    return this.catalogService.pressOnSettings().shapes;
  }

  get pressOnSettings() {
    return this.catalogService.pressOnSettings();
  }

  get cotizadorContent(): CotizadorContent {
    return this.catalogService.cotizadorContent();
  }

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

  get selectedShapeLabel(): string {
    return this.shapes.find(s => s.id === this.pressOnData.shape)?.label || this.pressOnData.shape;
  }

  toggleSizeGuide() {
    this.showSizeGuide = !this.showSizeGuide;
  }

  formatPrice(val: number): string {
    return this.quoteService.formatCurrency(val);
  }

  openAppointmentCart() {
    this.cartService.openDrawer();
  }

  // --- CANVA LIVE EDITORS: SETS PRESS-ON ---
  async onShapePhotoChange(shapeId: string, event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      try {
        const base64 = await this.catalogService.convertFileToBase64(file);
        this.catalogService.updatePressOnShape(shapeId, { imageUrl: base64 });
        this.notificationService.success('¡Foto de forma de uña actualizada!');
      } catch {
        this.notificationService.warning('Error al procesar la foto.');
      }
    }
  }

  updateShapeLabel(shapeId: string, event: Event) {
    const target = event.target as HTMLElement;
    const val = target.innerText.trim();
    if (val) {
      this.catalogService.updatePressOnShape(shapeId, { label: val });
    }
  }

  async onPressOnBannerChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      try {
        const base64 = await this.catalogService.convertFileToBase64(file);
        this.catalogService.updatePressOnSettings({ bannerImage: base64 });
        this.notificationService.success('¡Foto de Press-On Nails actualizada!');
      } catch {
        this.notificationService.warning('Error al procesar la foto.');
      }
    }
  }

  updatePressOnBasePrice(event: Event) {
    const target = event.target as HTMLElement;
    const cleanNum = parseInt(target.innerText.replace(/[^\d]/g, ''), 10);
    if (!isNaN(cleanNum) && cleanNum > 0) {
      this.catalogService.updatePressOnSettings({ basePrice: cleanNum });
      this.notificationService.info(`Inversión base de Press-On actualizada a ${this.formatPrice(cleanNum)}`);
    }
  }

  updateCotizadorField(field: keyof CotizadorContent, event: Event) {
    const target = event.target as HTMLElement;
    const val = target.innerText.trim();
    if (val) {
      this.catalogService.updateCotizadorContent({ [field]: val });
    }
  }

  sendPressOnOrder() {
    const url = this.quoteService.generatePressOnWhatsAppUrl(
      this.selectedShapeLabel,
      this.pressOnData.length,
      this.pressOnData.size,
      this.pressOnData.city,
      this.pressOnData.clientName,
      this.pressOnData.theme
    );

    this.notificationService.success('Abriendo WhatsApp para encargar tu set Press-On...');
    window.open(url, '_blank');
  }
}
