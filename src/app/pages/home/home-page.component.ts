import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeroComponent } from '../../features/hero/hero.component';
import { TaglineRevealComponent } from '../../features/tagline-reveal/tagline-reveal.component';
import { ServicesListComponent } from '../../features/services-list/services-list.component';
import { PressOnComponent } from '../../features/press-on/press-on.component';
import { QuoteModalComponent } from '../../features/quote-modal/quote-modal.component';
@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    CommonModule,
    HeroComponent,
    TaglineRevealComponent,
    ServicesListComponent,
    PressOnComponent,
    QuoteModalComponent
  ],
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent {
  selectedServiceId = signal<string | null>(null);

  onServiceSelected(serviceId: string) {
    this.selectedServiceId.set(serviceId);
  }
}
