import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  PLATFORM_ID,
  signal
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HoverRevealService } from '../../../core/services/hover-reveal.service';

@Component({
  selector: 'app-hover-reveal-preview',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="hover-reveal-floating"
      [class.is-visible]="service.state().visible"
      [style.transform]="transformStyle()"
      aria-hidden="true">
      <div class="reveal-card-inner">
        <img
          *ngIf="service.state().imageUrl"
          [src]="service.state().imageUrl"
          [alt]="service.state().label"
          class="reveal-preview-img"
        />
        <div *ngIf="service.state().label" class="reveal-preview-caption">
          <span class="reveal-dot"></span>
          <span>{{ service.state().label }}</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .hover-reveal-floating {
      position: fixed;
      top: 0;
      left: 0;
      width: 210px;
      height: 250px;
      pointer-events: none;
      z-index: 9500;
      opacity: 0;
      will-change: transform, opacity;
      transition: opacity 240ms cubic-bezier(0.22, 1, 0.36, 1);

      &.is-visible {
        opacity: 1;

        .reveal-card-inner {
          transform: scale(1);
          clip-path: inset(0% 0% 0% 0% round 14px);
        }
      }
    }

    .reveal-card-inner {
      position: relative;
      width: 100%;
      height: 100%;
      border-radius: 14px;
      overflow: hidden;
      background: #0a0f18;
      border: 1.5px solid rgba(56, 189, 248, 0.65);
      box-shadow:
        0 20px 44px rgba(0, 0, 0, 0.55),
        0 0 22px rgba(0, 212, 255, 0.28);
      transform: scale(0.84);
      clip-path: inset(14% 10% 14% 10% round 14px);
      transition:
        transform 340ms cubic-bezier(0.22, 1, 0.36, 1),
        clip-path 340ms cubic-bezier(0.22, 1, 0.36, 1);
    }

    .reveal-preview-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .reveal-preview-caption {
      position: absolute;
      left: 8px;
      right: 8px;
      bottom: 8px;
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 10px;
      border-radius: 8px;
      background: rgba(10, 15, 24, 0.84);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      border: 1px solid rgba(155, 199, 230, 0.28);
      color: #f7fdfe;
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.03em;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .reveal-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #00d4ff;
      box-shadow: 0 0 8px #00d4ff;
      flex-shrink: 0;
    }
  `]
})
export class HoverRevealPreviewComponent implements OnInit, OnDestroy {
  service = inject(HoverRevealService);
  private platformId = inject(PLATFORM_ID);

  private rafId: number | null = null;
  private currentX = -300;
  private currentY = -300;
  private currentRot = 0;

  transformStyle = signal<string>('translate3d(-300px, -300px, 0)');

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;
    if (typeof window.matchMedia !== 'function' || !window.matchMedia('(pointer: fine)').matches) return;
    this.tick();
  }

  ngOnDestroy() {
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
  }

  private tick = () => {
    const st = this.service.state();
    // Offset slightly right and up from cursor so it never covers the hovered text
    const margin = 22;
    const cardW = 210;
    const cardH = 250;
    let targetX = st.x + margin;
    let targetY = st.y - cardH * 0.55;

    if (targetX + cardW > window.innerWidth - 16) {
      targetX = st.x - cardW - margin;
    }
    if (targetY < 16) {
      targetY = 16;
    } else if (targetY + cardH > window.innerHeight - 16) {
      targetY = window.innerHeight - cardH - 16;
    }

    const dx = targetX - this.currentX;
    const dy = targetY - this.currentY;
    this.currentX += dx * 0.16;
    this.currentY += dy * 0.16;

    const targetRot = Math.max(-10, Math.min(10, dx * 0.14));
    this.currentRot += (targetRot - this.currentRot) * 0.14;

    this.transformStyle.set(
      `translate3d(${this.currentX.toFixed(1)}px, ${this.currentY.toFixed(1)}px, 0) rotate(${this.currentRot.toFixed(2)}deg)`
    );

    this.rafId = requestAnimationFrame(this.tick);
  };
}
