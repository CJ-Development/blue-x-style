import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CatalogService } from '../../../core/services/catalog.service';
import { NailService } from '../../../core/models/service.model';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-admin-toolbar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-toolbar.component.html',
  styleUrls: ['./admin-toolbar.component.scss']
})
export class AdminToolbarComponent {
  catalogService = inject(CatalogService);
  notificationService = inject(NotificationService);

  showNewModal = signal<boolean>(false);

  newServiceData: NailService = {
    id: '',
    name: '',
    category: 'manicura',
    basePrice: 50000,
    durationEstimate: 'Aprox. 2h',
    description: '',
    features: ['Preparación rusa', 'Esmaltado de alta durabilidad'],
    badge: 'Nuevo Estilo',
    imageUrl: 'images/portfolio/work_1.jpg',
    popular: false
  };

  newFeatureInput = '';
  previewImageBase64 = '';

  openNewModal() {
    this.newServiceData = {
      id: 'custom-' + Date.now(),
      name: '',
      category: 'manicura',
      basePrice: 50000,
      durationEstimate: 'Aprox. 2h',
      description: '',
      features: ['Técnica rusa', 'Durabilidad garantizada'],
      badge: 'Nuevo',
      imageUrl: 'images/portfolio/work_1.jpg',
      popular: false
    };
    this.previewImageBase64 = '';
    this.showNewModal.set(true);
  }

  closeNewModal() {
    this.showNewModal.set(false);
  }

  addFeature() {
    if (this.newFeatureInput.trim()) {
      this.newServiceData.features.push(this.newFeatureInput.trim());
      this.newFeatureInput = '';
    }
  }

  removeFeature(index: number) {
    this.newServiceData.features.splice(index, 1);
  }

  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const base64 = await this.catalogService.convertFileToBase64(file);
      this.newServiceData.imageUrl = base64;
      this.previewImageBase64 = base64;
    }
  }

  saveNewService() {
    if (!this.newServiceData.name.trim()) {
      this.notificationService.warning('Por favor ingresa un nombre para el servicio');
      return;
    }

    this.catalogService.addService({ ...this.newServiceData });
    this.notificationService.success(`¡Servicio "${this.newServiceData.name}" agregado exitosamente!`);
    this.closeNewModal();
  }

  resetCatalog() {
    if (confirm('¿Deseas restablecer los precios y fotos originales del catálogo?')) {
      this.catalogService.resetToDefaults();
      this.notificationService.info('Catálogo restablecido a valores originales.');
    }
  }

  logout() {
    this.catalogService.logout();
    this.notificationService.info('Sesión de administrador cerrada.');
  }
}
