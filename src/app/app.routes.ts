import { Routes } from '@angular/router';
import { HomePageComponent } from './pages/home/home-page.component';

export const routes: Routes = [
  {
    path: '',
    component: HomePageComponent,
    title: 'Blue X Style by Yeye | Manicura & Pedicura de Lujo a Domicilio'
  },
  {
    path: 'politicas',
    loadComponent: () => import('./pages/policies/policies-page.component').then(m => m.PoliciesPageComponent),
    title: 'Políticas de Atención a Domicilio | Blue X Style by Yeye'
  },
  {
    path: 'politicas-de-atencion',
    redirectTo: 'politicas'
  },
  {
    path: 'preguntas-frecuentes',
    loadComponent: () => import('./pages/faq/faq-page.component').then(m => m.FaqPageComponent),
    title: 'Preguntas Frecuentes | Blue X Style by Yeye'
  },
  {
    path: 'faq',
    redirectTo: 'preguntas-frecuentes'
  },
  {
    path: 'cotizar',
    loadComponent: () => import('./pages/booking/booking-page.component').then(m => m.BookingPageComponent),
    title: 'Personalizar Press-On Nails & Cotizador | Blue X Style'
  },
  {
    path: 'reservar',
    redirectTo: 'cotizar'
  },
  {
    path: 'admin',
    loadComponent: () => import('./pages/admin-login/admin-login-page.component').then(m => m.AdminLoginPageComponent),
    title: 'Portal de Administración | Blue X Style'
  },
  {
    path: 'login',
    redirectTo: 'admin'
  },
  {
    path: '**',
    redirectTo: ''
  }
];
