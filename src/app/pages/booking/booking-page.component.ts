import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { QuoteModalComponent } from '../../features/quote-modal/quote-modal.component';

@Component({
  selector: 'app-booking-page',
  standalone: true,
  imports: [CommonModule, RouterLink, QuoteModalComponent],
  templateUrl: './booking-page.component.html',
  styleUrls: ['./booking-page.component.scss']
})
export class BookingPageComponent implements OnInit {
  private route = inject(ActivatedRoute);

  selectedServiceId = signal<string | null>(null);
  designNotes = signal<string>('');

  ngOnInit() {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    this.route.queryParams.subscribe(params => {
      if (params['service']) {
        this.selectedServiceId.set(params['service']);
      }

      const design = params['design'];
      const shape = params['shape'];
      const length = params['length'];

      if (design) {
        let note = `Diseño de referencia: ${design}`;
        if (shape || length) {
          note += ` · Forma: ${shape || 'A convenir'} · Largo: ${length || 'A convenir'}`;
        }
        this.designNotes.set(note);
      }
    });
  }
}
