import {
  Component,
  Input,
  ElementRef,
  OnInit,
  OnDestroy,
  inject,
  PLATFORM_ID,
  signal,
  computed
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

interface OdometerToken {
  type: 'digit' | 'static';
  digit: number;
  char: string;
}

@Component({
  selector: 'app-odometer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="odometer-wrap" [attr.aria-label]="ariaLabel()">
      <span *ngIf="prefix" class="odo-affix">{{ prefix }}</span>
      <span class="odo-digits" aria-hidden="true">
        <ng-container *ngFor="let token of tokens(); let i = index">
          <span *ngIf="token.type === 'static'" class="odo-sep">{{ token.char }}</span>
          <span *ngIf="token.type === 'digit'" class="odo-reel-window">
            <span
              class="odo-reel-strip"
              [style.transform]="'translateY(-' + (token.digit * 10) + '%)'"
              [style.transitionDelay.ms]="i * 22">
              <span *ngFor="let d of digitScale" class="odo-reel-num">{{ d }}</span>
            </span>
          </span>
        </ng-container>
      </span>
      <span *ngIf="suffix" class="odo-affix">{{ suffix }}</span>
    </span>
  `,
  styles: [`
    :host {
      display: inline-flex;
      align-items: baseline;
    }

    .odometer-wrap {
      display: inline-flex;
      align-items: baseline;
      font-variant-numeric: tabular-nums;
      line-height: 1.05;
    }

    .odo-digits {
      display: inline-flex;
      align-items: baseline;
    }

    .odo-affix {
      display: inline-block;
    }

    .odo-sep {
      display: inline-block;
      padding: 0 0.02em;
    }

    .odo-reel-window {
      display: inline-block;
      height: 1.05em;
      overflow: hidden;
      vertical-align: bottom;
      position: relative;
    }

    .odo-reel-strip {
      display: flex;
      flex-direction: column;
      will-change: transform;
      transition: transform 640ms cubic-bezier(0.22, 1, 0.36, 1);
    }

    .odo-reel-num {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 1.05em;
      line-height: 1.05em;
    }

    @media (prefers-reduced-motion: reduce) {
      .odo-reel-strip {
        transition: none !important;
      }
    }
  `]
})
export class OdometerComponent implements OnInit, OnDestroy {
  readonly digitScale = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

  private _targetValue = signal<number>(0);
  private _active = signal<boolean>(false);

  @Input() set value(v: number) {
    this._targetValue.set(Number.isFinite(v) ? v : 0);
  }
  @Input() prefix = '';
  @Input() suffix = '';
  @Input() decimals = 0;
  @Input() thousandsSeparator = '.';
  @Input() decimalSeparator = '.';
  @Input() animateOnScroll = false;

  private el = inject(ElementRef<HTMLElement>);
  private platformId = inject(PLATFORM_ID);
  private observer: IntersectionObserver | null = null;

  private displayedValue = computed(() => {
    if (!this._active()) return 0;
    return this._targetValue();
  });

  ariaLabel = computed(() => `${this.prefix}${this.formatNumber(this._targetValue())}${this.suffix}`);

  tokens = computed<OdometerToken[]>(() => {
    const formatted = this.formatNumber(this.displayedValue());
    return Array.from(formatted).map(ch => {
      if (ch >= '0' && ch <= '9') {
        return { type: 'digit', digit: Number(ch), char: ch };
      }
      return { type: 'static', digit: 0, char: ch };
    });
  });

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) {
      this._active.set(true);
      return;
    }

    if (!this.animateOnScroll || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setTimeout(() => this._active.set(true), 60);
      return;
    }

    if ('IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              this._active.set(true);
              this.observer?.disconnect();
            }
          });
        },
        { threshold: 0.25 }
      );
      this.observer.observe(this.el.nativeElement);
    } else {
      this._active.set(true);
    }
  }

  ngOnDestroy() {
    this.observer?.disconnect();
  }

  private formatNumber(num: number): string {
    const fixed = this.decimals > 0 ? num.toFixed(this.decimals) : Math.round(num).toString();
    const parts = fixed.split('.');
    const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, this.thousandsSeparator);
    return parts.length > 1 ? `${intPart}${this.decimalSeparator}${parts[1]}` : intPart;
  }
}
