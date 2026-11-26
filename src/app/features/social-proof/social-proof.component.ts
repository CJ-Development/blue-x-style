import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SplitTextComponent } from '../../shared/components/split-text/split-text.component';
import { MagneticDirective } from '../../shared/directives/magnetic.directive';
import { FlyToCartService } from '../../core/services/fly-to-cart.service';
import { CatalogService } from '../../core/services/catalog.service';
import { NotificationService } from '../../core/services/notification.service';

export interface ClientReview {
  name: string;
  neighborhood: string;
  serviceId: string;
  serviceName: string;
  rating: number;
  comment: string;
  daysLasted: string;
  avatarInitials: string;
}

@Component({
  selector: 'app-social-proof',
  standalone: true,
  imports: [CommonModule, SplitTextComponent, MagneticDirective],
  templateUrl: './social-proof.component.html',
  styleUrls: ['./social-proof.component.scss']
})
export class SocialProofComponent {
  private cartService = inject(FlyToCartService);
  private catalogService = inject(CatalogService);
  private notificationService = inject(NotificationService);

  // Posición del comparador Antes/Después (0 a 100%)
  sliderPos = signal<number>(52);
  isDragging = signal<boolean>(false);

  reviews: ClientReview[] = [
    {
      name: 'Camila R.',
      neighborhood: 'Usaquén, Bogotá',
      serviceId: 'dipping-rubber-polygel',
      serviceName: 'Nivelación Rubber / Dipping',
      rating: 5,
      comment: 'Mis uñas siempre se partían a la semana y con la nivelación de Yeye cumplí 26 días intactas. Además no tuve que salir de casa.',
      daysLasted: '26 días intactas',
      avatarInitials: 'CR'
    },
    {
      name: 'Valentina M.',
      neighborhood: 'Chapinero, Bogotá',
      serviceId: 'liquid-chrome-3d',
      serviceName: 'Liquid Chrome & Relieve 3D',
      rating: 5,
      comment: 'El nivel de detalle en el cromo líquido y las gotas 3D es otro nivel. La limpieza de cutícula rusa me dejó las manos de revista.',
      daysLasted: '24 días brillo espejo',
      avatarInitials: 'VM'
    },
    {
      name: 'Sofía G.',
      neighborhood: 'Cedritos, Bogotá',
      serviceId: 'mani-semi',
      serviceName: 'Manicura Semipermanente',
      rating: 5,
      comment: 'Súper puntual, trae todo esterilizado y súper organizado. Pedí combo manicura + pedicura a domicilio y quedé enamorada.',
      daysLasted: '22 días sin levantar',
      avatarInitials: 'SG'
    }
  ];

  onSliderInput(event: Event) {
    const val = Number((event.target as HTMLInputElement).value);
    if (Number.isFinite(val)) {
      this.sliderPos.set(Math.max(5, Math.min(95, val)));
    }
  }

  tryReviewedService(review: ClientReview, event: MouseEvent) {
    const svc = this.catalogService.getServiceById(review.serviceId);
    const triggerEl = event.currentTarget as HTMLElement;
    this.cartService.flyToQuoteCart(
      triggerEl,
      {
        id: svc?.id || review.serviceId,
        name: svc?.name || review.serviceName,
        imageUrl: svc?.imageUrl || 'images/portfolio/work_1.jpg',
        price: svc?.basePrice || 50000,
        duration: svc?.durationEstimate || 'Aprox. 2h'
      },
      () => {
        this.notificationService.success(`"${svc?.name || review.serviceName}" añadido a tu carrito de cita.`);
      }
    );
  }
}
