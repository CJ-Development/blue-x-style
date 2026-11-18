import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  private router = inject(Router);
  currentYear = new Date().getFullYear();

  get hideFinalCta(): boolean {
    const url = this.router.url;
    return url.includes('preguntas-frecuentes') || url.includes('faq') || url.includes('politicas');
  }

  get isFaqPage(): boolean {
    return this.hideFinalCta;
  }
}
