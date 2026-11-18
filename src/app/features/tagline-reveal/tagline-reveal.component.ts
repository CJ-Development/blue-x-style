import {
  Component,
  ElementRef,
  OnInit,
  OnDestroy,
  ViewChild,
  inject,
  PLATFORM_ID,
  signal
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-tagline-reveal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tagline-reveal.component.html',
  styleUrls: ['./tagline-reveal.component.scss']
})
export class TaglineRevealComponent implements OnInit, OnDestroy {
  @ViewChild('taglineSection', { static: true }) sectionRef!: ElementRef<HTMLElement>;

  private platformId = inject(PLATFORM_ID);
  activeWordIndex = signal<number>(0);

  // Minimum 2 lines benefit statement per Rule B11
  phraseWords: string[] = [
    'Tus', 'manos', 'merecen', 'la', 'precisión', 'de', 'un', 'estudio', 'de', 'alta', 'costura,',
    'sin', 'filas,', 'sin', 'tráfico', 'y', 'en', 'la', 'tranquilidad', 'de', 'tu', 'propio', 'espacio.'
  ];

  private observer: IntersectionObserver | null = null;
  private scrollHandler: (() => void) | null = null;

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.initScrollReveal();
    }
  }

  ngOnDestroy() {
    if (this.scrollHandler) {
      window.removeEventListener('scroll', this.scrollHandler);
    }
    this.observer?.disconnect();
  }

  private initScrollReveal() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.activeWordIndex.set(this.phraseWords.length);
      return;
    }

    let ticking = false;
    this.scrollHandler = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          this.updateRevealOnScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', this.scrollHandler, { passive: true });
    this.updateRevealOnScroll();
  }

  private updateRevealOnScroll() {
    if (!this.sectionRef) return;
    const rect = this.sectionRef.nativeElement.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    const startY = windowHeight * 0.85;
    const endY = windowHeight * 0.25;

    const progress = Math.min(1, Math.max(0, (startY - rect.top) / (startY - endY)));
    const targetIndex = Math.floor(progress * this.phraseWords.length);
    this.activeWordIndex.set(targetIndex);
  }
}