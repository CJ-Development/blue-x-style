import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  signal,
  PLATFORM_ID
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ThemeService } from '../../../core/services/theme.service';

export type NavSection = 'inicio' | 'lookbook' | 'servicios' | 'press-on' | 'cotizador';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, OnDestroy {
  themeService = inject(ThemeService);
  private platformId = inject(PLATFORM_ID);

  activeSection = signal<NavSection>('inicio');
  private observer: IntersectionObserver | null = null;

  navItems: { id: NavSection; label: string; icon: string }[] = [
    { id: 'inicio', label: 'Inicio', icon: 'home' },
    { id: 'lookbook', label: 'Lookbook', icon: 'gallery' },
    { id: 'servicios', label: 'Tarifas', icon: 'tag' },
    { id: 'press-on', label: 'Press-On', icon: 'sparkles' },
    { id: 'cotizador', label: 'Cotizar', icon: 'chat' }
  ];

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.initScrollSpy();
    }
  }

  ngOnDestroy() {
    this.observer?.disconnect();
  }

  private initScrollSpy() {
    const sectionIds: NavSection[] = ['inicio', 'lookbook', 'servicios', 'press-on', 'cotizador'];
    
    // Intersection observer con threshold balanceado para vista móvil
    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const id = entry.target.id as NavSection;
            if (sectionIds.includes(id)) {
              this.activeSection.set(id);
            }
          }
        }
      },
      {
        rootMargin: '-20% 0px -55% 0px',
        threshold: 0
      }
    );

    // Observar cada sección si existe en la página
    setTimeout(() => {
      sectionIds.forEach((id) => {
        const el = document.getElementById(id);
        if (el) {
          this.observer?.observe(el);
        }
      });
    }, 400);
  }

  scrollToSection(id: NavSection) {
    this.activeSection.set(id);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}