import { Injectable, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { NailService } from '../models/service.model';
import { CatalogService } from './catalog.service';
import { QuoteService } from './quote.service';

export interface QuoteBagItem {
  id: string;
  name: string;
  imageUrl: string;
  price: number;
  duration?: string;
  quantity: number;
  note?: string;
  addedAt: number;
}

export interface ServiceRecommendation {
  service: NailService;
  reason: string;
  tag: string;
}

const BAG_STORAGE_KEY = 'bxs_quote_bag_v1';

@Injectable({
  providedIn: 'root'
})
export class FlyToCartService {
  private platformId = inject(PLATFORM_ID);
  private catalogService = inject(CatalogService);
  private quoteService = inject(QuoteService);

  // Bolsa / carrito reactivo de servicios acumulados para cita a domicilio
  bagItems = signal<QuoteBagItem[]>(this.loadSavedBag());
  cartPulse = signal<boolean>(false);
  isDrawerOpen = signal<boolean>(false);

  // Preferencias del carrito
  selectedComplexityId = signal<'basic' | 'moderate' | 'complex'>('basic');
  selectedNeighborhood = signal<string>('Usaquén');
  customNeighborhood = signal<string>('');
  clientName = signal<string>('');
  extraNotes = signal<string>('');

  // Contadores y totales reactivos (alimentan los Odómetros)
  totalCount = computed(() =>
    this.bagItems().reduce((sum, item) => sum + item.quantity, 0)
  );

  servicesSubtotal = computed(() =>
    this.bagItems().reduce((sum, item) => sum + item.price * item.quantity, 0)
  );

  complexityExtra = computed(() => {
    if (this.bagItems().length === 0) return 0;
    const comp = this.catalogService
      .complexityLevels()
      .find(c => c.id === this.selectedComplexityId());
    return comp ? comp.extraPrice : 0;
  });

  totalEstimated = computed(() => this.servicesSubtotal() + this.complexityExtra());

  depositAmount = computed(() => {
    const pct = this.catalogService.pressOnSettings().depositPercent || 20;
    return Math.round(this.totalEstimated() * (pct / 100));
  });

  /** Motor inteligente de recomendaciones basado en los servicios ya elegidos */
  recommendations = computed<ServiceRecommendation[]>(() => {
    const allServices = this.catalogService.services();
    const inCartIds = new Set(this.bagItems().map(i => i.id));
    const inCartServices = allServices.filter(s => inCartIds.has(s.id));

    if (inCartServices.length === 0) {
      // Si el carrito está vacío, sugerir los 3 más populares
      return allServices
        .filter(s => s.popular)
        .slice(0, 3)
        .map(service => ({
          service,
          reason: 'Favorito de nuestras clientas en Bogotá',
          tag: 'Top Elegido'
        }));
    }

    const rules: Record<string, { targetId: string; reason: string; tag: string }[]> = {
      'mani-semi': [
        { targetId: 'pedi-semi', reason: 'Combo perfecto: manos y pies con brillo 21 días en la misma visita', tag: 'Combo Ideal' },
        { targetId: 'dipping-rubber-polygel', reason: 'Refuerza uñas finas para evitar quiebres y lograr curvatura perfecta', tag: 'Extra Fuerza' },
        { targetId: 'cat-eye-sapphire', reason: 'Eleva tu semipermanente con destellos magnéticos 9D', tag: 'Upgrade Glow' }
      ],
      'dipping-rubber-polygel': [
        { targetId: 'pedi-semi', reason: 'Aprovecha la visita a domicilio para dejar tus pies igual de impecables', tag: 'Combo Spa' },
        { targetId: 'cat-eye-sapphire', reason: 'El efecto magnético 9D luce increíble sobre una base nivelada', tag: 'Match Pro' },
        { targetId: 'pedi-tradicional', reason: 'Cuidado esencial de pies mientras luce tu estructura nivelada', tag: 'Cuidado Total' }
      ],
      'liquid-chrome-3d': [
        { targetId: 'pedi-semi', reason: 'Equilibra tu diseño 3D de alto impacto con unos pies impecables a juego', tag: 'Look Completo' },
        { targetId: 'dipping-rubber-polygel', reason: 'Ideal para acompañante o refuerzo extra de estructura', tag: 'Alta Duración' },
        { targetId: 'cat-eye-sapphire', reason: 'Combina cromo líquido con tonos zafiro galácticos', tag: 'Tendencia Y2K' }
      ],
      'sistemas-artificiales': [
        { targetId: 'pedi-semi', reason: 'Completa tu transformación VIP con pedicura semipermanente en casa', tag: 'Combo VIP' },
        { targetId: 'liquid-chrome-3d', reason: 'Añade arte 3D y relieves cromo sobre tus extensiones esculpidas', tag: 'Arte 3D' },
        { targetId: 'pedi-tradicional', reason: 'Cuidado spa de pies en la misma cita a domicilio', tag: 'Spa en Casa' }
      ],
      'cat-eye-sapphire': [
        { targetId: 'pedi-semi', reason: 'Haz match en pies con tonos oscuros o zafiro duraderos', tag: 'Match Perfecto' },
        { targetId: 'dipping-rubber-polygel', reason: 'Dale mayor resistencia anatómica a tus uñas naturales', tag: 'Base Fuerte' }
      ],
      'pedi-semi': [
        { targetId: 'mani-semi', reason: 'Completa el dúo manos + pies semipermanentes en una sola visita', tag: 'Dúo Favorito' },
        { targetId: 'dipping-rubber-polygel', reason: 'Manos fuertes y niveladas a juego con tu pedicura', tag: 'Estructura Pro' },
        { targetId: 'cat-eye-sapphire', reason: 'Dale un toque galáctico a tus manos junto a tu pedicura', tag: 'Efecto 9D' }
      ],
      'mani-tradicional': [
        { targetId: 'pedi-tradicional', reason: 'Sesión clásica completa de manos y pies sin salir de casa', tag: 'Combo Clásico' },
        { targetId: 'mani-semi', reason: '¿Quieres que el brillo dure 3 semanas? Sube a semipermanente', tag: 'Más Duración' }
      ],
      'pedi-tradicional': [
        { targetId: 'mani-tradicional', reason: 'Combina con manicura rusa tradicional para una limpieza impecable', tag: 'Combo Limpio' },
        { targetId: 'mani-semi', reason: 'Pies spa + manos semipermanentes de larga duración', tag: 'Combo Inteligente' }
      ]
    };

    const picks: ServiceRecommendation[] = [];
    const seen = new Set<string>(inCartIds);

    for (const s of inCartServices) {
      const candidates = rules[s.id] || [];
      for (const cand of candidates) {
        if (seen.has(cand.targetId)) continue;
        const targetService = allServices.find(x => x.id === cand.targetId);
        if (targetService) {
          seen.add(targetService.id);
          picks.push({
            service: targetService,
            reason: cand.reason,
            tag: cand.tag
          });
        }
        if (picks.length >= 3) break;
      }
      if (picks.length >= 3) break;
    }

    // Completar por categoría complementaria (si solo tiene manos -> sugerir pies y viceversa)
    if (picks.length < 3) {
      const hasPedicura = inCartServices.some(s => s.category === 'pedicura');
      const fallbackPool = allServices.filter(s => !seen.has(s.id));
      fallbackPool.sort((a, b) => {
        const aScore = (!hasPedicura && a.category === 'pedicura') ? 2 : (a.popular ? 1 : 0);
        const bScore = (!hasPedicura && b.category === 'pedicura') ? 2 : (b.popular ? 1 : 0);
        return bScore - aScore;
      });

      for (const s of fallbackPool) {
        if (picks.length >= 3) break;
        seen.add(s.id);
        picks.push({
          service: s,
          reason: s.category === 'pedicura'
            ? 'Complementa tu cita con cuidado profesional de pies a domicilio'
            : 'Excelente complemento para potenciar tu sesión VIP',
          tag: 'Recomendado'
        });
      }
    }

    return picks;
  });

  get itemCount(): number {
    return this.totalCount();
  }

  private loadSavedBag(): QuoteBagItem[] {
    if (!isPlatformBrowser(this.platformId)) return [];
    try {
      const raw = localStorage.getItem(BAG_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // ignore storage errors
    }
    return [];
  }

  private persistBag(items: QuoteBagItem[]) {
    if (!isPlatformBrowser(this.platformId)) return;
    try {
      localStorage.setItem(BAG_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore storage errors
    }
  }

  openDrawer() {
    this.isDrawerOpen.set(true);
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = 'hidden';
    }
  }

  closeDrawer() {
    this.isDrawerOpen.set(false);
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = '';
    }
  }

  toggleDrawer() {
    if (this.isDrawerOpen()) {
      this.closeDrawer();
    } else {
      this.openDrawer();
    }
  }

  addItem(item: { id: string; name: string; imageUrl: string; price?: number; duration?: string; note?: string }) {
    const catalogMatch = this.catalogService.getServiceById(item.id);
    const resolvedPrice = item.price ?? catalogMatch?.basePrice ?? 50000;
    const resolvedDuration = item.duration ?? catalogMatch?.durationEstimate ?? 'Aprox. 2h';

    this.bagItems.update(list => {
      const existingIndex = list.findIndex(x => x.id === item.id);
      let updated: QuoteBagItem[];
      if (existingIndex >= 0) {
        updated = list.map((x, idx) =>
          idx === existingIndex
            ? {
                ...x,
                quantity: x.quantity + 1,
                note: item.note || x.note,
                addedAt: Date.now()
              }
            : x
        );
      } else {
        updated = [
          {
            id: item.id,
            name: item.name,
            imageUrl: item.imageUrl || catalogMatch?.imageUrl || 'images/portfolio/work_1.jpg',
            price: resolvedPrice,
            duration: resolvedDuration,
            quantity: 1,
            note: item.note,
            addedAt: Date.now()
          },
          ...list
        ];
      }
      this.persistBag(updated);
      return updated;
    });
  }

  updateQuantity(id: string, delta: number) {
    this.bagItems.update(list => {
      const updated = list
        .map(item =>
          item.id === id ? { ...item, quantity: item.quantity + delta } : item
        )
        .filter(item => item.quantity > 0);
      this.persistBag(updated);
      return updated;
    });
  }

  removeItem(id: string) {
    this.bagItems.update(list => {
      const updated = list.filter(item => item.id !== id);
      this.persistBag(updated);
      return updated;
    });
  }

  clearBag() {
    this.bagItems.set([]);
    this.persistBag([]);
  }

  /**
   * Construye un mensaje dinámico de WhatsApp adaptado al número y tipo de servicios elegidos
   */
  buildDynamicWhatsAppUrl(): string {
    const items = this.bagItems();
    const complexity = this.catalogService
      .complexityLevels()
      .find(c => c.id === this.selectedComplexityId());

    const neighborhood =
      this.selectedNeighborhood() === 'Otro barrio' && this.customNeighborhood().trim()
        ? this.customNeighborhood().trim()
        : this.selectedNeighborhood();

    const isCombo = this.totalCount() > 1;
    const lines: string[] = [
      isCombo
        ? '*SOLICITUD DE CITA COMBO A DOMICILIO - BLUE X STYLE*'
        : '*SOLICITUD DE CITA A DOMICILIO - BLUE X STYLE*',
      '-----------------------------------------'
    ];

    if (items.length === 1 && items[0].quantity === 1) {
      const only = items[0];
      lines.push(`• *Servicio elegido:* ${only.name} (${this.quoteService.formatCurrency(only.price)})`);
      if (only.duration) lines.push(`• *Duración estimada:* ${only.duration}`);
      if (only.note) lines.push(`• *Referencia:* ${only.note}`);
    } else {
      lines.push(`*Servicios acumulados (${this.totalCount()}):*`);
      items.forEach((it, idx) => {
        const qtyTag = it.quantity > 1 ? ` x${it.quantity}` : '';
        const linePrice = this.quoteService.formatCurrency(it.price * it.quantity);
        lines.push(`  ${idx + 1}. ${it.name}${qtyTag} — ${linePrice}`);
        if (it.note) lines.push(`     _${it.note}_`);
      });
    }

    if (complexity) {
      const extraTxt =
        complexity.extraPrice > 0
          ? ` (+ ${this.quoteService.formatCurrency(complexity.extraPrice)})`
          : ' (Sin recargo)';
      lines.push(`• *Nivel de diseño:* ${complexity.title}${extraTxt}`);
    }

    lines.push(`• *Sector / Barrio en Bogotá:* ${neighborhood}`);
    if (this.clientName().trim()) {
      lines.push(`• *Cliente:* ${this.clientName().trim()}`);
    }
    if (this.extraNotes().trim()) {
      lines.push(`• *Notas o ideas:* ${this.extraNotes().trim()}`);
    }

    lines.push('-----------------------------------------');
    lines.push(`• *Total estimado:* ${this.quoteService.formatCurrency(this.totalEstimated())}`);
    lines.push(`• *Abono sugerido (20%):* ${this.quoteService.formatCurrency(this.depositAmount())}`);
    lines.push('-----------------------------------------');
    lines.push(
      isCombo
        ? '¡Hola Yeye! Armé este combo de servicios en tu web. ¿Qué fechas u horarios tienes disponibles para agendar mi cita a domicilio? ¡Gracias!'
        : '¡Hola Yeye! Elegí este servicio en tu web. ¿Qué fechas u horarios tienes disponibles esta semana para cita a domicilio? ¡Quedo atenta/o!'
    );

    return `https://api.whatsapp.com/send?phone=${this.quoteService.contactPhone}&text=${encodeURIComponent(lines.join('\n'))}`;
  }

  /**
   * Lanza una miniatura fotográfica en trayectoria parabólica Bézier desde
   * el elemento origen hasta el botón de Mi Cita en el navbar/dock
   */
  flyToQuoteCart(
    sourceEl: HTMLElement | null,
    item: { id: string; name: string; imageUrl: string; price?: number; duration?: string; note?: string },
    onComplete?: () => void
  ) {
    this.addItem(item);

    if (!isPlatformBrowser(this.platformId)) {
      onComplete?.();
      return;
    }

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const desktopTarget = document.getElementById('quote-cart-target-desktop');
    const mobileTarget = document.getElementById('quote-cart-target-mobile');
    const targetEl =
      desktopTarget && desktopTarget.offsetParent !== null ? desktopTarget : mobileTarget;

    if (reducedMotion || !sourceEl || !targetEl) {
      this.triggerCartBump();
      onComplete?.();
      return;
    }

    const startRect = sourceEl.getBoundingClientRect();
    const endRect = targetEl.getBoundingClientRect();

    const startX = startRect.left + startRect.width / 2;
    const startY = startRect.top + startRect.height / 2;
    const endX = endRect.left + endRect.width / 2;
    const endY = endRect.top + endRect.height / 2;

    const flyer = document.createElement('div');
    flyer.className = 'bxs-fly-to-cart-orb';
    flyer.style.cssText = `
      position: fixed;
      left: 0;
      top: 0;
      width: 64px;
      height: 64px;
      border-radius: 50%;
      overflow: hidden;
      border: 2px solid #00d4ff;
      box-shadow: 0 0 22px rgba(0, 212, 255, 0.85), 0 8px 24px rgba(0, 0, 0, 0.45);
      pointer-events: none;
      z-index: 10050;
      will-change: transform, opacity;
      background: #0a0f18;
    `;

    const img = document.createElement('img');
    img.src = item.imageUrl || 'images/portfolio/work_1.jpg';
    img.alt = '';
    img.style.cssText = 'width: 100%; height: 100%; object-fit: cover; display: block;';
    flyer.appendChild(img);
    document.body.appendChild(flyer);

    const ctrlX = (startX + endX) / 2 + (endX > startX ? -60 : 60);
    const ctrlY = Math.min(startY, endY) - 110;

    const duration = 660;
    const startTime = performance.now();

    const step = (now: number) => {
      const rawT = Math.min(1, (now - startTime) / duration);
      const t = rawT < 0.5 ? 4 * rawT * rawT * rawT : 1 - Math.pow(-2 * rawT + 2, 3) / 2;
      const mt = 1 - t;

      const x = mt * mt * startX + 2 * mt * t * ctrlX + t * t * endX;
      const y = mt * mt * startY + 2 * mt * t * ctrlY + t * t * endY;
      const scale = 1 - 0.72 * t + Math.sin(t * Math.PI) * 0.25;
      const rot = t * 240;
      const opacity = rawT > 0.85 ? 1 - (rawT - 0.85) / 0.15 : 1;

      flyer.style.transform = `translate3d(${x - 32}px, ${y - 32}px, 0) scale(${scale.toFixed(3)}) rotate(${rot.toFixed(1)}deg)`;
      flyer.style.opacity = opacity.toFixed(3);

      if (rawT < 1) {
        requestAnimationFrame(step);
      } else {
        flyer.remove();
        this.spawnArrivalSparkles(endX, endY);
        this.triggerCartBump();
        onComplete?.();
      }
    };

    requestAnimationFrame(step);
  }

  private triggerCartBump() {
    this.cartPulse.set(false);
    setTimeout(() => this.cartPulse.set(true), 10);
    setTimeout(() => this.cartPulse.set(false), 620);
  }

  private spawnArrivalSparkles(cx: number, cy: number) {
    for (let i = 0; i < 8; i++) {
      const dot = document.createElement('span');
      const angle = (i / 8) * Math.PI * 2;
      const dist = 22 + Math.random() * 18;
      dot.style.cssText = `
        position: fixed;
        left: ${cx}px;
        top: ${cy}px;
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: ${i % 2 === 0 ? '#00d4ff' : '#f7fdfe'};
        box-shadow: 0 0 10px #00d4ff;
        pointer-events: none;
        z-index: 10051;
        transition: transform 420ms cubic-bezier(0.22, 1, 0.36, 1), opacity 420ms ease;
      `;
      document.body.appendChild(dot);
      requestAnimationFrame(() => {
        dot.style.transform = `translate3d(${Math.cos(angle) * dist}px, ${Math.sin(angle) * dist}px, 0) scale(0.2)`;
        dot.style.opacity = '0';
      });
      setTimeout(() => dot.remove(), 450);
    }
  }
}
