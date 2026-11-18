import { Routes } from '@angular/router';
import { HomePageComponent } from './pages/home/home-page.component';
import { BookingPageComponent } from './pages/booking/booking-page.component';
import { FaqPageComponent } from './pages/faq/faq-page.component';
import { PoliciesPageComponent } from './pages/policies/policies-page.component';

export const routes: Routes = [
  {
    path: '',
    component: HomePageComponent,
    title: 'Blue X Style by Yeye | Manicura & Pedicura de Lujo a Domicilio'
  },
  {
    path: 'politicas',
    component: PoliciesPageComponent,
    title: 'Políticas de Atención a Domicilio | Blue X Style by Yeye'
  },
  {
    path: 'politicas-de-atencion',
    redirectTo: 'politicas'
  },
  {
    path: 'preguntas-frecuentes',
    component: FaqPageComponent,
    title: 'Preguntas Frecuentes | Blue X Style by Yeye'
  },
  {
    path: 'faq',
    redirectTo: 'preguntas-frecuentes'
  },
  {
    path: 'cotizar',
    component: BookingPageComponent,
    title: 'Reservar Cita & Cotizador a Domicilio | Blue X Style'
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