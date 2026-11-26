import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeroComponent } from '../../features/hero/hero.component';
import { TaglineRevealComponent } from '../../features/tagline-reveal/tagline-reveal.component';
import { ScrollCarouselComponent } from '../../features/scroll-carousel/scroll-carousel.component';
import { ServicesListComponent } from '../../features/services-list/services-list.component';
import { SocialProofComponent } from '../../features/social-proof/social-proof.component';
import { PressOnComponent } from '../../features/press-on/press-on.component';
import { QuoteModalComponent } from '../../features/quote-modal/quote-modal.component';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    CommonModule,
    HeroComponent,
    TaglineRevealComponent,
    ScrollCarouselComponent,
    ServicesListComponent,
    SocialProofComponent,
    PressOnComponent,
    QuoteModalComponent
  ],
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss']
})
export class HomePageComponent {
  selectedServiceId = signal<string | null>(null);
  selectedDesignNote = signal<string | null>(null);

  onServiceSelected(serviceId: string) {
    this.selectedServiceId.set(serviceId);
  }

  onCarouselDesignSelected(payload: { serviceId: string; note: string }) {
    this.selectedServiceId.set(payload.serviceId);
    this.selectedDesignNote.set(payload.note);
  }
}
