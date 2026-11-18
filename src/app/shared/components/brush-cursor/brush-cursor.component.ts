import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  PLATFORM_ID,
  signal,
  HostListener
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-brush-cursor',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './brush-cursor.component.html',
  styleUrls: ['./brush-cursor.component.scss']
})
export class BrushCursorComponent implements OnInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);

  posX = signal<number>(-100);
  posY = signal<number>(-100);
  isHovering = signal<boolean>(false);
  isClicking = signal<boolean>(false);
  isVisible = signal<boolean>(false);

  private mouseMoveHandler: ((e: MouseEvent) => void) | null = null;
  private mouseOverHandler: ((e: MouseEvent) => void) | null = null;
  private mouseOutHandler: ((e: MouseEvent) => void) | null = null;
  private mouseDownHandler: (() => void) | null = null;
  private mouseUpHandler: (() => void) | null = null;

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      // Solo en dispositivos con puntero fino (mouse)
      if (window.matchMedia('(pointer: fine)').matches) {
        this.initCursor();
      }
    }
  }

  ngOnDestroy() {
    if (isPlatformBrowser(this.platformId)) {
      if (this.mouseMoveHandler) window.removeEventListener('mousemove', this.mouseMoveHandler);
      if (this.mouseOverHandler) document.removeEventListener('mouseover', this.mouseOverHandler);
      if (this.mouseOutHandler) document.removeEventListener('mouseout', this.mouseOutHandler);
      if (this.mouseDownHandler) window.removeEventListener('mousedown', this.mouseDownHandler);
      if (this.mouseUpHandler) window.removeEventListener('mouseup', this.mouseUpHandler);
    }
  }

  private initCursor() {
    this.mouseMoveHandler = (e: MouseEvent) => {
      this.posX.set(e.clientX);
      this.posY.set(e.clientY);
      if (!this.isVisible()) this.isVisible.set(true);
    };

    // Detectar si pasa sobre elementos interactivos o texto
    this.mouseOverHandler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target) {
        const isInteractive = target.closest('a, button, input, select, textarea, .brush-interactive, .brush-stroke-text, .cal-day-cell, .thumb-item, .category-badge, h1, h2, h3, .heading-2, .heading-4');
        this.isHovering.set(!!isInteractive);
      }
    };

    this.mouseOutHandler = (e: MouseEvent) => {
      if (!e.relatedTarget) {
        this.isVisible.set(false);
      }
    };

    this.mouseDownHandler = () => {
      this.isClicking.set(true);
    };

    this.mouseUpHandler = () => {
      this.isClicking.set(false);
    };

    window.addEventListener('mousemove', this.mouseMoveHandler, { passive: true });
    document.addEventListener('mouseover', this.mouseOverHandler, { passive: true });
    document.addEventListener('mouseout', this.mouseOutHandler, { passive: true });
    window.addEventListener('mousedown', this.mouseDownHandler, { passive: true });
    window.addEventListener('mouseup', this.mouseUpHandler, { passive: true });
  }
}
