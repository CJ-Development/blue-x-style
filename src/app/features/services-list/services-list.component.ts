import { Component, Output, EventEmitter, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CatalogService } from '../../core/services/catalog.service';
import { QuoteService } from '../../core/services/quote.service';
import { NailService } from '../../core/models/service.model';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-services-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './services-list.component.html',
  styleUrls: ['./services-list.component.scss']
})
export class ServicesListComponent {
  catalogService = inject(CatalogService);
  private quoteService = inject(QuoteService);
  private notificationService = inject(NotificationService);

  @Output() selectServiceForQuote = new EventEmitter<string>();

  categories = [
    { id: 'todos', label: 'Todos los Diseños & Servicios' },
    { id: 'manicura', label: 'Manicura Rusa' },
    { id: 'pedicura', label: 'Pedicura Spa' },
    { id: 'estructuras', label: 'Nivelación & Rubber' },
    { id: 'sistemas', label: 'Sistemas Esculpidos & 3D' }
  ];

  // Modal Lightbox para ampliar foto
  activeLightboxItem = signal<NailService | null>(null);

  // Edición inline de precio (Canva style)
  editingPriceId = signal<string | null>(null);
  tempPriceInput: number = 0;

  get filteredServices(): NailService[] {
    return this.catalogService.filteredServices();
  }

  setCategory(cat: string) {
    this.catalogService.selectedCategory.set(cat);
  }

  formatPrice(price: number): string {
    return this.catalogService.formatPrice(price);
  }

  onSelectService(serviceId: string) {
    this.selectServiceForQuote.emit(serviceId);
    this.quoteService.setBookingMode('domicilio');
    
    const cotizador = document.getElementById('cotizador');
    if (cotizador) {
      cotizador.scrollIntoView({ behavior: 'smooth' });
    }
  }

  // --- LIGHTBOX ---
  openLightbox(service: NailService) {
    this.activeLightboxItem.set(service);
  }

  closeLightbox() {
    this.activeLightboxItem.set(null);
  }

  // --- CANVA LIVE EDITING METHODS ---

  startEditingPrice(service: NailService, event: MouseEvent) {
    if (!this.catalogService.isEditMode()) return;
    event.stopPropagation();
    this.tempPriceInput = service.basePrice;
    this.editingPriceId.set(service.id);
  }

  savePrice(service: NailService) {
    if (this.tempPriceInput > 0) {
      this.catalogService.updateService(service.id, { basePrice: Number(this.tempPriceInput) });
      this.notificationService.success(`Precio de "${service.name}" actualizado a ${this.formatPrice(this.tempPriceInput)}`);
    }
    this.editingPriceId.set(null);
  }

  cancelPriceEdit() {
    this.editingPriceId.set(null);
  }

  onTitleChange(service: NailService, newTitle: string) {
    if (!this.catalogService.isEditMode() || !newTitle?.trim()) return;
    this.catalogService.updateService(service.id, { name: newTitle.trim() });
  }

  onDescriptionChange(service: NailService, newDesc: string) {
    if (!this.catalogService.isEditMode()) return;
    this.catalogService.updateService(service.id, { description: newDesc.trim() });
  }

  onDurationChange(service: NailService, newDuration: string) {
    if (!this.catalogService.isEditMode() || !newDuration?.trim()) return;
    this.catalogService.updateService(service.id, { durationEstimate: newDuration.trim() });
  }

  async onImageFileChange(service: NailService, event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const base64 = await this.catalogService.convertFileToBase64(file);
      this.catalogService.updateService(service.id, { imageUrl: base64 });
      this.notificationService.success(`¡Foto de "${service.name}" actualizada con éxito!`);
    }
  }

  deleteService(service: NailService, event: MouseEvent) {
    event.stopPropagation();
    if (confirm(`¿Seguro que deseas eliminar "${service.name}" del catálogo?`)) {
      this.catalogService.deleteService(service.id);
      this.notificationService.info(`Servicio "${service.name}" eliminado.`);
    }
  }
}
