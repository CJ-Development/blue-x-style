import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

export interface HeroFeaturedStyle {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  technique: string;
  duration: string;
  price: string;
  image: string;
  serviceId: string;
}

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.scss']
})
export class HeroComponent {
  featuredStyles: HeroFeaturedStyle[] = [
    {
      id: 'chrome-y2k',
      title: 'Nail Art 3D & Liquid Chrome',
      subtitle: 'Firma de Blue X Style',
      badge: 'Tendencia Y2K',
      technique: 'Efecto espejo plateado y azul zafiro con relieves en gel sólido',
      duration: 'Aprox. 2.5h',
      price: 'Desde $50.000 COP',
      image: 'images/portfolio/work_1.jpg',
      serviceId: 'mani-semi'
    },
    {
      id: 'rubber-base',
      title: 'Nivelación con Base Rubber',
      subtitle: 'Fuerza & Curvatura Anatómica',
      badge: 'Cero Desprendimientos',
      technique: 'Manicura rusa profunda, cutícula milimétrica y curvatura natural para uñas fuertes',
      duration: 'Aprox. 2h - 2.5h',
      price: 'Desde $60.000 COP',
      image: 'images/portfolio/work_8.jpg',
      serviceId: 'dipping-rubber-polygel'
    },
    {
      id: 'sistemas-softgel',
      title: 'Sistemas Softgel & Polygel',
      subtitle: 'Extensiones Esculpidas de Lujo',
      badge: 'Extensiones Top',
      technique: 'Forma almendrada, coffin o stiletto irrompible y ultraligera a tu medida',
      duration: '3h o más',
      price: 'Desde $90.000 COP',
      image: 'images/portfolio/work_11.jpg',
      serviceId: 'sistemas-artificiales'
    },
    {
      id: 'press-on-custom',
      title: 'Press-On Nails de Colección',
      subtitle: 'Uñas Reutilizables a Medida',
      badge: 'Envíos Nacionales',
      technique: 'Sets personalizados a tu medida con kit de aplicación express en 10 minutos',
      duration: 'Aplicación 10 min',
      price: 'Desde $40.000 COP',
      image: 'images/portfolio/work_4.jpg',
      serviceId: 'press-on'
    }
  ];

  selectedStyleIndex = signal<number>(0);

  get currentStyle(): HeroFeaturedStyle {
    return this.featuredStyles[this.selectedStyleIndex()];
  }

  selectStyle(index: number) {
    this.selectedStyleIndex.set(index);
  }
}