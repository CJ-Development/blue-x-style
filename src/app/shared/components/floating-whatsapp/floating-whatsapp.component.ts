import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuoteService } from '../../../core/services/quote.service';
import { MagneticDirective } from '../../directives/magnetic.directive';

@Component({
  selector: 'app-floating-whatsapp',
  standalone: true,
  imports: [CommonModule, MagneticDirective],
  templateUrl: './floating-whatsapp.component.html',
  styleUrls: ['./floating-whatsapp.component.scss']
})
export class FloatingWhatsappComponent {
  private quoteService = inject(QuoteService);

  get whatsappUrl(): string {
    const message = 'Hola Yeye, tengo una consulta sobre tus servicios de manicure/pedicura a domicilio o Press-On Nails.';
    return `https://api.whatsapp.com/send?phone=${this.quoteService.contactPhone}&text=${encodeURIComponent(message)}`;
  }
}
