import { Injectable, signal, effect, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type AppTheme = 'dark' | 'light';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private platformId = inject(PLATFORM_ID);
  
  // Default to dark theme as requested by client (matching the aesthetic Y2K liquid chrome logo)
  theme = signal<AppTheme>('dark');

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const savedTheme = localStorage.getItem('bxs_theme_v2') as AppTheme;
      if (savedTheme === 'light' || savedTheme === 'dark') {
        this.theme.set(savedTheme);
      } else {
        // Modo oscuro por defecto para resaltar la estética Y2K y cromo líquido
        this.theme.set('dark');
        localStorage.setItem('bxs_theme_v2', 'dark');
        localStorage.setItem('bxs_theme', 'dark');
      }
    }

    effect(() => {
      const current = this.theme();
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem('bxs_theme_v2', current);
        localStorage.setItem('bxs_theme', current);
        document.documentElement.setAttribute('data-theme', current);
        if (current === 'dark') {
          document.documentElement.classList.add('dark');
          document.documentElement.classList.remove('light');
        } else {
          document.documentElement.classList.add('light');
          document.documentElement.classList.remove('dark');
        }
      }
    });
  }

  toggleTheme() {
    this.theme.update(t => t === 'dark' ? 'light' : 'dark');
  }
}
