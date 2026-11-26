import { Component, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FlyToCartService, ServiceRecommendation } from '../../../core/services/fly-to-cart.service';
import { CatalogService } from '../../../core/services/catalog.service';
import { QuoteService } from '../../../core/services/quote.service';
import { NotificationService } from '../../../core/services/notification.service';
import { OdometerComponent } from '../odometer/odometer.component';
import { MagneticDirective } from '../../directives/magnetic.directive';

@Component({
  selector: 'app-quote-cart-drawer',
  standalone: true,
  imports: [CommonModule, FormsModule, OdometerComponent, MagneticDirective],
  templateUrl: './quote-cart-drawer.component.html',
  styleUrls: ['./quote-cart-drawer.component.scss']
})
export class QuoteCartDrawerComponent {
  cartService = inject(FlyToCartService);
  catalogService = inject(CatalogService);
  private quoteService = inject(QuoteService);
  private notificationService = inject(NotificationService);

  popularNeighborhoods = [
    'Usaquén',
    'Chapinero',
    'Suba',
    'Teusaquillo',
    'Cedritos',
    'Chicó',
    'Otro barrio'
  ];

  @HostListener('document:keydown.escape')
  onEscape() {
    if (this.cartService.isDrawerOpen()) {
      this.cartService.closeDrawer();
    }
  }

  formatPrice(val: number): string {
    return this.quoteService.formatCurrency(val);
  }

  addRecommendation(rec: ServiceRecommendation) {
    this.cartService.addItem({
      id: rec.service.id,
      name: rec.service.name,
      imageUrl: rec.service.imageUrl || 'images/portfolio/work_1.jpg',
      price: rec.service.basePrice,
      duration: rec.service.durationEstimate
    });
    this.notificationService.success(`+ "${rec.service.name}" añadido a tu cita.`);
  }

  sendToWhatsApp() {
    if (this.cartService.bagItems().length === 0) {
      this.notificationService.warning('Agrega al menos un servicio del catálogo para cotizar tu cita.');
      return;
    }

    const url = this.cartService.buildDynamicWhatsAppUrl();
    this.notificationService.success('Abriendo WhatsApp con el resumen personalizado de tu cita...');
    window.open(url, '_blank');
  }
}
