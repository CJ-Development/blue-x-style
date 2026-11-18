import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PORTFOLIO_ITEMS, PortfolioItem } from '../../core/data/portfolio-photos';

@Component({
  selector: 'app-lookbook',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lookbook.component.html',
  styleUrls: ['./lookbook.component.scss']
})
export class LookbookComponent {
  readonly items = PORTFOLIO_ITEMS;
  readonly categories = [
    'Todos',
    'Cromo & Y2K',
    'Cat Eye',
    '3D Nail Art',
    'Aura & Art',
    'Elegancia & Nude',
    'Press-On Sets'
  ];

  selectedCategory = signal<string>('Todos');
  activePhotoZoom = signal<PortfolioItem | null>(null);

  filteredItems = computed(() => {
    const cat = this.selectedCategory();
    if (cat === 'Todos') {
      return this.items;
    }
    return this.items.filter(item => item.category === cat);
  });

  setCategory(cat: string) {
    this.selectedCategory.set(cat);
  }

  openZoom(item: PortfolioItem) {
    this.activePhotoZoom.set(item);
  }

  closeZoom() {
    this.activePhotoZoom.set(null);
  }
}
