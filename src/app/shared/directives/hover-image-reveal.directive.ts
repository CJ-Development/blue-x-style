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
import { HoverRevealService } from '../../core/services/hover-reveal.service';

@Directive({
  selector: '[appHoverImageReveal]',
  standalone: true
})
export class HoverImageRevealDirective implements OnInit, OnDestroy {
  @Input('appHoverImageReveal') imageUrl = '';
  @Input() revealLabel = '';

  private el = inject(ElementRef<HTMLElement>);
  private platformId = inject(PLATFORM_ID);
  private hoverRevealService = inject(HoverRevealService);

  private onMouseEnter = (e: MouseEvent) => {
    if (!this.imageUrl) return;
    this.hoverRevealService.show(this.imageUrl, this.revealLabel, e.clientX, e.clientY);
  };

  private onMouseMove = (e: MouseEvent) => {
    if (!this.imageUrl) return;
    this.hoverRevealService.move(e.clientX, e.clientY);
  };

  private onMouseLeave = () => {
    this.hoverRevealService.hide();
  };

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;
    if (!window.matchMedia('(pointer: fine)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const nativeEl = this.el.nativeElement;
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
    this.hoverRevealService.hide();
  }
}
