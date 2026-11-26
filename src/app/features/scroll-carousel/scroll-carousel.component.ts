import {
  Component,
  ElementRef,
  EventEmitter,
  OnInit,
  OnDestroy,
  Output,
  ViewChild,
  inject,
  PLATFORM_ID,
  signal
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { PORTFOLIO_ITEMS, PortfolioItem } from '../../core/data/portfolio-photos';
import { SplitTextComponent } from '../../shared/components/split-text/split-text.component';
import { FlyToCartService } from '../../core/services/fly-to-cart.service';
import { QuoteService } from '../../core/services/quote.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-scroll-carousel',
  standalone: true,
  imports: [CommonModule, SplitTextComponent],
  templateUrl: './scroll-carousel.component.html',
  styleUrls: ['./scroll-carousel.component.scss']
})
export class ScrollCarouselComponent implements OnInit, OnDestroy {
  @ViewChild('carouselSection', { static: true }) sectionRef!: ElementRef<HTMLElement>;
  @ViewChild('topTrack', { static: true }) topTrackRef!: ElementRef<HTMLElement>;
  @ViewChild('bottomTrack', { static: true }) bottomTrackRef!: ElementRef<HTMLElement>;

  @Output() selectDesign = new EventEmitter<{ serviceId: string; note: string }>();

  private platformId = inject(PLATFORM_ID);
  private flyToCart = inject(FlyToCartService);
  private quoteService = inject(QuoteService);
  private notificationService = inject(NotificationService);

  // Dos filas cinematográficas con repetición para cobertura fluida en cualquier viewport
  readonly topRow: PortfolioItem[] = [...PORTFOLIO_ITEMS.slice(0, 6), ...PORTFOLIO_ITEMS.slice(0, 6)];
  readonly bottomRow: PortfolioItem[] = [...PORTFOLIO_ITEMS.slice(6, 12), ...PORTFOLIO_ITEMS.slice(6, 12)];

  isHovered = signal<boolean>(false);

  private rafId: number | null = null;
  private currentScroll = 0;
  private targetScroll = 0;
  private smoothVelocity = 0;
  private ambientOffset = 0;
  private lastTime = 0;

  private scrollListener = () => {
    this.targetScroll = window.scrollY || 0;
  };

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    this.targetScroll = window.scrollY || 0;
    this.currentScroll = this.targetScroll;
    this.lastTime = performance.now();

    window.addEventListener('scroll', this.scrollListener, { passive: true });
    this.rafId = requestAnimationFrame(this.animate);
  }

  ngOnDestroy() {
    if (!isPlatformBrowser(this.platformId)) return;
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
    window.removeEventListener('scroll', this.scrollListener);
  }

  private animate = (now: number) => {
    const dt = Math.min(0.05, (now - this.lastTime) / 1000);
    this.lastTime = now;

    // Interpolación física sedosa del scroll + deriva ambiental sutil
    const prevScroll = this.currentScroll;
    this.currentScroll += (this.targetScroll - this.currentScroll) * 0.1;
    const rawVelocity = this.currentScroll - prevScroll;
    this.smoothVelocity += (rawVelocity - this.smoothVelocity) * 0.14;

    if (!this.isHovered()) {
      this.ambientOffset += dt * 18;
    }

    const sectionRect = this.sectionRef?.nativeElement.getBoundingClientRect();
    const isNearViewport =
      sectionRect && sectionRect.bottom > -300 && sectionRect.top < window.innerHeight + 300;

    if (isNearViewport) {
      // Desplazamiento guiado por scroll en direcciones opuestas
      const topWidth = (this.topTrackRef.nativeElement.scrollWidth || 1600) / 2;
      const bottomWidth = (this.bottomTrackRef.nativeElement.scrollWidth || 1600) / 2;

      const topOffset = ((this.currentScroll * 0.42 + this.ambientOffset) % topWidth);
      const bottomOffset = ((this.currentScroll * 0.36 + this.ambientOffset * 0.85) % bottomWidth);

      const skew = Math.max(-4.5, Math.min(4.5, this.smoothVelocity * 0.08));

      this.topTrackRef.nativeElement.style.transform =
        `translate3d(-${topOffset.toFixed(1)}px, 0, 0) skewX(${skew.toFixed(2)}deg)`;

      this.bottomTrackRef.nativeElement.style.transform =
        `translate3d(${(bottomOffset - bottomWidth).toFixed(1)}px, 0, 0) skewX(${(-skew).toFixed(2)}deg)`;
    }

    this.rafId = requestAnimationFrame(this.animate);
  };

  onPickDesign(item: PortfolioItem, event: MouseEvent) {
    const targetCard = event.currentTarget as HTMLElement;
    const isPressOn = item.category.toLowerCase().includes('press-on');
    const serviceId = isPressOn
      ? 'press-on'
      : item.category.includes('Cromo') || item.category.includes('3D')
        ? 'liquid-chrome-3d'
        : item.category.includes('Cat Eye')
          ? 'cat-eye-sapphire'
          : 'mani-semi';

    if (isPressOn) {
      this.quoteService.setBookingMode('press-on');
      this.selectDesign.emit({
        serviceId: 'press-on',
        note: `Diseño Press-On: ${item.title} (${item.technique})`
      });
      const cotizador = document.getElementById('cotizador');
      if (cotizador) {
        cotizador.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }

    this.flyToCart.flyToQuoteCart(
      targetCard,
      {
        id: serviceId,
        name: item.title,
        imageUrl: item.imageUrl,
        note: `${item.technique} (${item.shape} · ${item.length})`
      },
      () => {
        this.selectDesign.emit({
          serviceId,
          note: `Me encantó el diseño: ${item.title} (${item.technique})`
        });
        this.notificationService.success(
          `"${item.title}" sumado a tu carrito de cita (${this.flyToCart.totalCount()}).`
        );
      }
    );
  }
}
