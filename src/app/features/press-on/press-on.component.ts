import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuoteService } from '../../core/services/quote.service';
import { CatalogService } from '../../core/services/catalog.service';
import { FlyToCartService } from '../../core/services/fly-to-cart.service';
import { SplitTextComponent } from '../../shared/components/split-text/split-text.component';
import { OdometerComponent } from '../../shared/components/odometer/odometer.component';
import { MagneticDirective } from '../../shared/directives/magnetic.directive';
import { HoverImageRevealDirective } from '../../shared/directives/hover-image-reveal.directive';

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
  imports: [
    CommonModule,
    SplitTextComponent,
    OdometerComponent,
    MagneticDirective,
    HoverImageRevealDirective
  ],
  templateUrl: './press-on.component.html',
  styleUrls: ['./press-on.component.scss']
})
export class PressOnComponent {
  private quoteService = inject(QuoteService);
  catalogService = inject(CatalogService);
  private flyToCart = inject(FlyToCartService);

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

  showSizeGuide = false;

  toggleSizeGuide() {
    this.showSizeGuide = !this.showSizeGuide;
  }

  goToCotizador(_event?: MouseEvent) {
    this.quoteService.setBookingMode('press-on');
    const el = document.getElementById('cotizador');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
