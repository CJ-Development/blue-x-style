import { TestBed } from '@angular/core/testing';
import { FlyToCartService } from './fly-to-cart.service';

describe('FlyToCartService', () => {
  let cart: FlyToCartService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    cart = TestBed.inject(FlyToCartService);
    cart.clearBag();
  });

  it('should accumulate multiple services and compute combo totals + 20% deposit', () => {
    cart.addItem({ id: 'mani-semi', name: 'Manicura Semipermanente', imageUrl: 'images/portfolio/work_4.jpg', price: 50000 });
    cart.addItem({ id: 'pedi-semi', name: 'Pedicura Semipermanente', imageUrl: 'images/portfolio/work_9.jpg', price: 45000 });

    expect(cart.totalCount()).toBe(2);
    expect(cart.servicesSubtotal()).toBe(95000);

    cart.selectedComplexityId.set('moderate'); // +15.000
    expect(cart.totalEstimated()).toBe(110000);
    expect(cart.depositAmount()).toBe(22000);
  });

  it('should recommend complementary services based on selected item without duplicates', () => {
    cart.addItem({ id: 'mani-semi', name: 'Manicura Semipermanente', imageUrl: 'images/portfolio/work_4.jpg', price: 50000 });
    const recs = cart.recommendations();

    expect(recs.length).toBeGreaterThan(0);
    expect(recs.some(r => r.service.id === 'pedi-semi')).toBe(true);
    expect(recs.some(r => r.service.id === 'mani-semi')).toBe(false);
  });

  it('should adapt WhatsApp message dynamically for single vs combo appointments', () => {
    cart.addItem({ id: 'mani-semi', name: 'Manicura Semipermanente', imageUrl: 'images/portfolio/work_4.jpg', price: 50000 });
    const singleUrl = decodeURIComponent(cart.buildDynamicWhatsAppUrl());
    expect(singleUrl).toContain('SOLICITUD DE CITA A DOMICILIO');
    expect(singleUrl).toContain('Manicura Semipermanente');

    cart.addItem({ id: 'pedi-semi', name: 'Pedicura Semipermanente', imageUrl: 'images/portfolio/work_9.jpg', price: 45000 });
    const comboUrl = decodeURIComponent(cart.buildDynamicWhatsAppUrl());
    expect(comboUrl).toContain('SOLICITUD DE CITA COMBO A DOMICILIO');
    expect(comboUrl).toContain('Servicios acumulados (2)');
    expect(comboUrl).toContain('$95.000 COP');
  });
});
