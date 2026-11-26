import {
  Component,
  EventEmitter,
  Output,
  OnInit,
  OnDestroy,
  signal,
  inject,
  PLATFORM_ID
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CatalogService, HeroFeaturedStyle } from '../../core/services/catalog.service';
import { NotificationService } from '../../core/services/notification.service';
import { QuoteService } from '../../core/services/quote.service';
import { FlyToCartService } from '../../core/services/fly-to-cart.service';
import { SplitTextComponent } from '../../shared/components/split-text/split-text.component';
import { OdometerComponent } from '../../shared/components/odometer/odometer.component';
import { MagneticDirective } from '../../shared/directives/magnetic.directive';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    SplitTextComponent,
    OdometerComponent,
    MagneticDirective
  ],
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.scss']
})
export class HeroComponent implements OnInit, OnDestroy {
  catalogService = inject(CatalogService);
  notificationService = inject(NotificationService);
  private quoteService = inject(QuoteService);
  private flyToCart = inject(FlyToCartService);
  private platformId = inject(PLATFORM_ID);

  @Output() selectHeroService = new EventEmitter<string>();

  selectedStyleIndex = signal<number>(0);
  orbitAngleDeg = signal<number>(-90);
  isOrbitPaused = signal<boolean>(false);

  private rafId: number | null = null;
  private lastTime = 0;
  private switchTimer = 0;
  private orbitRadius = 158;

  private resizeHandler = () => this.updateOrbitRadius();

  get featuredStyles(): HeroFeaturedStyle[] {
    return this.catalogService.heroStyles();
  }

  get currentStyle(): HeroFeaturedStyle {
    const list = this.featuredStyles;
    const idx = this.selectedStyleIndex();
    return list[idx] || list[0];
  }

  /** Extrae el valor numérico del precio para animarlo con el Odómetro al cambiar de tendencia */
  get currentNumericPrice(): number {
    const raw = this.currentStyle?.price || '';
    const digits = raw.replace(/[^\d]/g, '');
    const parsed = parseInt(digits, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 50000;
  }

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;
    this.updateOrbitRadius();
    window.addEventListener('resize', this.resizeHandler, { passive: true });

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    this.lastTime = performance.now();
    this.rafId = requestAnimationFrame(this.animateOrbit);
  }

  ngOnDestroy() {
    if (!isPlatformBrowser(this.platformId)) return;
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
    window.removeEventListener('resize', this.resizeHandler);
  }

  private updateOrbitRadius() {
    const w = window.innerWidth;
    if (w <= 420) {
      this.orbitRadius = 114;
    } else if (w <= 560) {
      this.orbitRadius = 128;
    } else {
      this.orbitRadius = 158;
    }
  }

  private animateOrbit = (now: number) => {
    const dt = Math.min(0.05, (now - this.lastTime) / 1000);
    this.lastTime = now;

    const editing = this.catalogService.isEditMode();
    if (!this.isOrbitPaused() && !editing) {
      // Rotación continua suave en círculo (18 grados por segundo = 1 vuelta cada 20s)
      this.orbitAngleDeg.update(deg => (deg + 18 * dt) % 360);

      // Cambiar automáticamente la imagen y precio del centro cada 4.5s al ritmo de la órbita
      this.switchTimer += dt;
      if (this.switchTimer >= 4.5) {
        this.switchTimer = 0;
        const total = this.featuredStyles.length;
        if (total > 1) {
          this.selectedStyleIndex.update(idx => (idx + 1) % total);
        }
      }
    }

    this.rafId = requestAnimationFrame(this.animateOrbit);
  };

  /** Calcula la posición orbital (x, y) manteniendo siempre derechas las miniaturas */
  getSatelliteTransform(index: number): string {
    const total = Math.max(1, this.featuredStyles.length);
    const angleDeg = this.orbitAngleDeg() + (index * 360) / total;
    const rad = (angleDeg * Math.PI) / 180;
    const x = Math.cos(rad) * this.orbitRadius;
    const y = Math.sin(rad) * this.orbitRadius;
    return `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
  }

  selectStyle(index: number) {
    this.selectedStyleIndex.set(index);
    this.switchTimer = 0;
  }

  quoteCurrentStyle(event: MouseEvent) {
    const style = this.currentStyle;
    const centerEl = (event.currentTarget as HTMLElement)
      ?.closest('.hero-showcase-wrapper')
      ?.querySelector('.photo-medallion') as HTMLElement | null;

    if (style.serviceId === 'press-on') {
      this.quoteService.setBookingMode('press-on');
      const cotizador = document.getElementById('cotizador');
      if (cotizador) {
        cotizador.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }

    const catalogServiceMatch = this.catalogService.getServiceById(style.serviceId);

    this.flyToCart.flyToQuoteCart(
      centerEl || (event.currentTarget as HTMLElement),
      {
        id: catalogServiceMatch?.id || style.serviceId,
        name: catalogServiceMatch?.name || style.title,
        imageUrl: style.image,
        price: catalogServiceMatch?.basePrice || this.currentNumericPrice,
        duration: catalogServiceMatch?.durationEstimate || style.duration,
        note: `Tendencia elegida del Hero: ${style.title} (${style.badge})`
      },
      () => {
        this.selectHeroService.emit(style.serviceId);
        this.notificationService.success(
          `"${style.title}" agregado a tu carrito de cita.`
        );
      }
    );
  }

  async onPhotoChange(event: Event, styleId: string) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      try {
        const base64 = await this.catalogService.convertFileToBase64(file);
        this.catalogService.updateHeroStyle(styleId, { image: base64 });
        this.notificationService.success('¡Foto de estilo actualizada!');
      } catch {
        this.notificationService.warning('Error al procesar la imagen seleccionada');
      }
    }
  }

  updateStyleField(styleId: string, field: keyof HeroFeaturedStyle, event: Event) {
    const target = event.target as HTMLElement;
    const val = target.innerText.trim();
    if (val) {
      this.catalogService.updateHeroStyle(styleId, { [field]: val });
    }
  }
}
