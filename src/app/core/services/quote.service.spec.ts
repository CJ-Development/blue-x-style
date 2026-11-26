import { TestBed } from '@angular/core/testing';
import { QuoteService } from './quote.service';

describe('QuoteService', () => {
  let service: QuoteService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(QuoteService);
  });

  it('should calculate base + complexity total and 20% deposit accurately', () => {
    const result = service.calculateQuote('mani-semi', 'moderate');
    expect(result.basePrice).toBe(50000);
    expect(result.extraPrice).toBe(15000);
    expect(result.totalEstimated).toBe(65000);
    expect(result.depositAmount).toBe(13000);
    expect(result.balanceRemaining).toBe(52000);
  });

  it('should format COP currency cleanly without double dollar signs', () => {
    expect(service.formatCurrency(50000)).toBe('$50.000 COP');
    expect(service.formatCurrency(125000)).toBe('$125.000 COP');
  });

  it('should generate Press-On WhatsApp URL with dynamic base price and specs', () => {
    const url = service.generatePressOnWhatsAppUrl('Almendra', 'Medio', 'M', 'Medellín', 'Sofía', 'Y2K');
    expect(url).toContain('https://api.whatsapp.com/send?phone=');
    expect(decodeURIComponent(url)).toContain('Almendra');
    expect(decodeURIComponent(url)).toContain('$40.000 COP');
    expect(decodeURIComponent(url)).toContain('Medellín');
  });
});
