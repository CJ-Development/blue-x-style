import {
  Directive,
  ElementRef,
  Input,
  OnInit,
  OnDestroy,
  inject,
  PLATFORM_ID
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Directive({
  selector: '[appMagnetic]',
  standalone: true
})
export class MagneticDirective implements OnInit, OnDestroy {
  @Input() magneticStrength = 0.28;
  @Input() magneticMaxDistance = 14;

  private el = inject(ElementRef<HTMLElement>);
  private platformId = inject(PLATFORM_ID);

  private isHovering = false;
  private rafId: number | null = null;
  private currentX = 0;
  private currentY = 0;
  private targetX = 0;
  private targetY = 0;

  private onMouseEnter = () => {
    this.isHovering = true;
    this.startLoop();
  };

  private onMouseMove = (e: MouseEvent) => {
    const rect = this.el.nativeElement.getBoundingClientRect();
    const relX = e.clientX - (rect.left + rect.width / 2);
    const relY = e.clientY - (rect.top + rect.height / 2);

    this.targetX = Math.max(
      -this.magneticMaxDistance,
      Math.min(this.magneticMaxDistance, relX * this.magneticStrength)
    );
    this.targetY = Math.max(
      -this.magneticMaxDistance,
      Math.min(this.magneticMaxDistance, relY * this.magneticStrength)
    );
  };

  private onMouseLeave = () => {
    this.isHovering = false;
    this.targetX = 0;
    this.targetY = 0;
    this.startLoop();
  };

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;
    if (typeof window.matchMedia !== 'function') return;
    if (!window.matchMedia('(pointer: fine)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const nativeEl = this.el.nativeElement;
    nativeEl.style.willChange = 'transform';

    nativeEl.addEventListener('mouseenter', this.onMouseEnter, { passive: true });
    nativeEl.addEventListener('mousemove', this.onMouseMove, { passive: true });
    nativeEl.addEventListener('mouseleave', this.onMouseLeave, { passive: true });
  }

  ngOnDestroy() {
    if (!isPlatformBrowser(this.platformId)) return;
    const nativeEl = this.el.nativeElement;
    nativeEl.removeEventListener('mouseenter', this.onMouseEnter);
    nativeEl.removeEventListener('mousemove', this.onMouseMove);
    nativeEl.removeEventListener('mouseleave', this.onMouseLeave);
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
  }

  private startLoop() {
    if (this.rafId !== null) return;
    this.rafId = requestAnimationFrame(this.tick);
  }

  private tick = () => {
    const ease = this.isHovering ? 0.22 : 0.14;
    this.currentX += (this.targetX - this.currentX) * ease;
    this.currentY += (this.targetY - this.currentY) * ease;

    const nativeEl = this.el.nativeElement;
    if (Math.abs(this.currentX) < 0.08 && Math.abs(this.currentY) < 0.08 && !this.isHovering) {
      this.currentX = 0;
      this.currentY = 0;
      nativeEl.style.transform = '';
      this.rafId = null;
      return;
    }

    nativeEl.style.transform = `translate3d(${this.currentX.toFixed(2)}px, ${this.currentY.toFixed(2)}px, 0)`;
    this.rafId = requestAnimationFrame(this.tick);
  };
}
