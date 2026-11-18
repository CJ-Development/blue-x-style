import { Component, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { QuoteService } from '../../core/services/quote.service';
import { NailService } from '../../core/models/service.model';

@Component({
  selector: 'app-services-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './services-list.component.html',
  styleUrls: ['./services-list.component.scss']
})
export class ServicesListComponent {
  private quoteService = inject(QuoteService);
  private router = inject(Router);
  
  @Output() selectServiceForQuote = new EventEmitter<string>();

  services: NailService[] = this.quoteService.getServices();
  selectedCategory: string = 'todos';

  categories = [
    { id: 'todos', label: 'Todos los Servicios' },
    { id: 'manicura', label: 'Manicura' },
    { id: 'pedicura', label: 'Pedicura' },
    { id: 'estructuras', label: 'Rubber & Refuerzo' },
    { id: 'sistemas', label: 'Sistemas Artificiales' }
  ];

  get filteredServices(): NailService[] {
    if (this.selectedCategory === 'todos') {
      return this.services;
    }
    return this.services.filter(s => s.category === this.selectedCategory);
  }

  setCategory(cat: string) {
    this.selectedCategory = cat;
  }

  formatPrice(price: number): string {
    return this.quoteService.formatCurrency(price);
  }

  onSelectService(serviceId: string) {
    this.selectServiceForQuote.emit(serviceId);
    this.router.navigate(['/cotizar'], {
      queryParams: { service: serviceId }
    });
  }
}
