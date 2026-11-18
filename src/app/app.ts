import { Component, AfterViewInit, inject, PLATFORM_ID, DestroyRef } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { BrushCursorComponent } from './shared/components/brush-cursor/brush-cursor.component';
import { ToastContainerComponent } from './shared/components/toast/toast-container.component';
import { FloatingWhatsappComponent } from './shared/components/floating-whatsapp/floating-whatsapp.component';
import { AdminToolbarComponent } from './shared/components/admin-toolbar/admin-toolbar.component';
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    NavbarComponent,
    FooterComponent,
    BrushCursorComponent,
    ToastContainerComponent,
    FloatingWhatsappComponent,
    AdminToolbarComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements AfterViewInit {
  private platformId = inject(PLATFORM_ID);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  private observer: IntersectionObserver | null = null;

  ngAfterViewInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    this.setupScrollObserver();

    // Re-check elements on route change
    const navSub = this.router.events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => {
        setTimeout(() => this.observeElements(), 120);
      });

    this.destroyRef.onDestroy(() => {
      navSub.unsubscribe();
      this.observer?.disconnect();
    });
  }

  private setupScrollObserver() {
    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('.reveal-on-scroll').forEach(el => el.classList.add('is-revealed'));
      return;
    }

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
          this.observer?.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      threshold: 0.12,
      rootMargin: '0px 0px -50px 0px'
    });

    this.observeElements();

    const mutationObserver = new MutationObserver(() => {
      this.observeElements();
    });

    mutationObserver.observe(document.body, { childList: true, subtree: true });

    this.destroyRef.onDestroy(() => {
      mutationObserver.disconnect();
    });
  }

  private observeElements() {
    if (!this.observer) return;
    const elements = document.querySelectorAll('.reveal-on-scroll:not(.is-revealed)');
    elements.forEach(el => this.observer!.observe(el));
  }
}
