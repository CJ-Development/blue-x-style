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

interface SplitWord {
  chars: string[];
  startIndex: number;
}

@Component({
  selector: 'app-split-text',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="split-text-root" [class.is-visible]="isVisible()" [class.gradient-mode]="gradient">
      <span
        *ngFor="let word of splitWords(); let wi = index"
        class="split-word">
        <span
          *ngFor="let ch of word.chars; let ci = index"
          class="split-char-mask">
          <span
            class="split-char"
            [style.transitionDelay.ms]="baseDelay + (word.startIndex + ci) * staggerMs">
            {{ ch }}
          </span>
        </span>
        <span *ngIf="wi < splitWords().length - 1" class="split-space">&nbsp;</span>
      </span>
    </span>
  `,
  styles: [`
    :host {
      display: inline;
    }

    .split-text-root {
      display: inline;
    }

    .split-word {
      display: inline-flex;
      white-space: nowrap;
    }

    .split-space {
      display: inline-block;
      width: 0.28em;
    }

    .split-char-mask {
      display: inline-block;
      overflow: hidden;
      vertical-align: bottom;
      padding-bottom: 0.06em;
      margin-bottom: -0.06em;
    }

    .split-char {
      display: inline-block;
      transform: translate3d(0, 115%, 0) rotate(5deg);
      opacity: 0;
      will-change: transform, opacity;
      transition:
        transform 680ms cubic-bezier(0.16, 1, 0.3, 1),
        opacity 520ms cubic-bezier(0.16, 1, 0.3, 1);
    }

    .split-text-root.is-visible .split-char {
      transform: translate3d(0, 0, 0) rotate(0deg);
      opacity: 1;
    }

    .split-text-root.gradient-mode .split-char {
      background: linear-gradient(180deg, #ffffff 0%, #9bc7e6 100%);
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    :host-context([data-theme="light"]) .split-text-root.gradient-mode .split-char {
      background: linear-gradient(180deg, #0c1825 0%, #1c6ba0 100%);
      -webkit-background-clip: text;
      background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    @media (prefers-reduced-motion: reduce) {
      .split-char {
        transform: none !important;
        opacity: 1 !important;
        transition: none !important;
      }
    }
  `]
})
export class SplitTextComponent implements OnInit, OnDestroy {
  private _text = signal<string>('');

  @Input() set text(val: string) {
    this._text.set(val || '');
  }
  @Input() staggerMs = 24;
  @Input() baseDelay = 0;
  @Input() immediate = false;
  @Input() gradient = false;

  private el = inject(ElementRef<HTMLElement>);
  private platformId = inject(PLATFORM_ID);
  private observer: IntersectionObserver | null = null;

  isVisible = signal<boolean>(false);

  splitWords = computed<SplitWord[]>(() => {
    const raw = this._text().trim();
    if (!raw) return [];
    const words = raw.split(/\s+/);
    let cursor = 0;
    return words.map(w => {
      const chars = Array.from(w);
      const item: SplitWord = { chars, startIndex: cursor };
      cursor += chars.length + 1;
      return item;
    });
  });

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) {
      this.isVisible.set(true);
      return;
    }

    if (this.immediate || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setTimeout(() => this.isVisible.set(true), 40);
      return;
    }

    if ('IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              this.isVisible.set(true);
              this.observer?.disconnect();
            }
          });
        },
        { threshold: 0.15, rootMargin: '0px 0px -30px 0px' }
      );
      this.observer.observe(this.el.nativeElement);
    } else {
      this.isVisible.set(true);
    }
  }

  ngOnDestroy() {
    this.observer?.disconnect();
  }
}
