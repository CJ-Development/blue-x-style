import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CatalogService, HeroFeaturedStyle } from '../../core/services/catalog.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.scss']
})
export class HeroComponent {
  catalogService = inject(CatalogService);
  notificationService = inject(NotificationService);

  get featuredStyles(): HeroFeaturedStyle[] {
    return this.catalogService.heroStyles();
  }

  selectedStyleIndex = signal<number>(0);

  get currentStyle(): HeroFeaturedStyle {
    const list = this.featuredStyles;
    const idx = this.selectedStyleIndex();
    return list[idx] || list[0];
  }

  selectStyle(index: number) {
    this.selectedStyleIndex.set(index);
  }

  async onPhotoChange(event: Event, styleId: string) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      try {
        const base64 = await this.catalogService.convertFileToBase64(file);
        this.catalogService.updateHeroStyle(styleId, { image: base64 });
        this.notificationService.success('¡Foto de estilo actualizada!');
      } catch (e) {
        this.notificationService.warning('Error al procesar la imagen seleccionada');
      }
    }
  }

  updateStyleField(styleId: string, field: keyof HeroFeaturedStyle, event: Event) {
    const target = event.target as HTMLElement;
    const val = target.innerText.trim();
    if (val) {
      this.catalogService.updateHeroStyle(styleId, { [field]: val });
    }
  }
}
