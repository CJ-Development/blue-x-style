import { Injectable, signal, computed } from '@angular/core';
import { NailService, NailComplexity, NAIL_SERVICES, COMPLEXITY_LEVELS } from '../models/service.model';

const STORAGE_KEY = 'bxs_services_db_v1';
const HERO_STORAGE_KEY = 'bxs_hero_styles_v1';
const COMPLEXITY_STORAGE_KEY = 'bxs_complexity_levels_v1';
const PRESS_ON_STORAGE_KEY = 'bxs_press_on_settings_v1';
const COTIZADOR_STORAGE_KEY = 'bxs_cotizador_content_v1';
const AUTH_KEY = 'bxs_admin_auth_v1';
const DEFAULT_PASSWORD = 'bluexstyle2026';

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

export interface PressOnShape {
  id: string;
  label: string;
  imageUrl?: string;
}

export interface PressOnSettings {
  basePrice: number;
  depositPercent: number;
  bannerImage: string;
  shapes: PressOnShape[];
}

export interface CotizadorContent {
  badge: string;
  title: string;
  subtitle: string;
  depositNote: string;
}

export const INITIAL_SERVICES: NailService[] = [
  {
    id: 'mani-semi',
    name: 'Manicura Semipermanente',
    category: 'manicura',
    basePrice: 50000,
    durationEstimate: 'Aprox. 2h',
    popular: true,
    badge: 'Más Solicitado',
    description: 'Esmaltado curado en lámpara LED/UV con brillo espejo que dura hasta 21 días intacto sin desprendimientos.',
    features: ['Preparación rusa/combinada de uña', 'Base niveladora protectora', 'Color ultra brillante de alta pigmentación', 'Secado instantáneo en lámpara'],
    imageUrl: 'images/portfolio/work_4.jpg'
  },
  {
    id: 'dipping-rubber-polygel',
    name: 'Nivelación Rubber / Dipping',
    category: 'estructuras',
    basePrice: 60000,
    durationEstimate: 'Hasta 3h',
    popular: true,
    badge: 'Estructura Fuerte',
    description: 'Ideal para uñas débiles o quebradizas. Brinda fuerza, curvatura perfecta y permite el crecimiento natural.',
    features: ['Base Rubber o Dipping reforzado', 'Recubrimiento protector en Polygel', 'Nivelación de superficie estriada', 'Acabado ultra natural y flexible'],
    imageUrl: 'images/portfolio/work_11.jpg'
  },
  {
    id: 'liquid-chrome-3d',
    name: 'Liquid Chrome & Relieve 3D',
    category: 'sistemas',
    basePrice: 95000,
    durationEstimate: 'Aprox. 3h',
    popular: true,
    badge: 'Alta Costura Y2K',
    description: 'Efecto espejo plateado y azul zafiro con relieves en gel sólido moldeados a mano alzada.',
    features: ['Estructura en polygel esculpido', 'Pigmento cromo espejo de grado óptico', 'Gotas y líneas orgánicas en 3D', 'Sellado anti-rayaduras'],
    imageUrl: 'images/portfolio/work_1.jpg'
  },
  {
    id: 'cat-eye-sapphire',
    name: 'Cat Eye 9D Magnético Azul Zafiro',
    category: 'manicura',
    basePrice: 65000,
    durationEstimate: '2h - 2.5h',
    popular: false,
    badge: 'Efecto Galáctico',
    description: 'Pigmento magnético tridimensional con destellos azul eléctrico y zafiro profundo que reaccionan a la luz.',
    features: ['Efecto magnético 9D multidireccional', 'Brillo cristalino de alta duración', 'Manicura rusa profunda', 'Hidratación con aceites esenciales'],
    imageUrl: 'images/portfolio/work_2.jpg'
  },
  {
    id: 'sistemas-artificiales',
    name: 'Sistemas Esculpidos (Softgel / Polygel)',
    category: 'sistemas',
    basePrice: 90000,
    durationEstimate: '3h o más',
    popular: false,
    badge: 'Extensiones VIP',
    description: 'Extensiones esculpidas a medida con tips de gel completo o polygel moldeado. Máxima resistencia y estética.',
    features: ['Largo y forma deseada (Almendra, Coffin, Stiletto)', 'Estructura ligera pero ultra resistente', 'Preparación premium sin daño a la uña natural', 'Apto para nail art complejo'],
    imageUrl: 'images/portfolio/work_7.jpg'
  },
  {
    id: 'pedi-semi',
    name: 'Pedicura Semipermanente',
    category: 'pedicura',
    basePrice: 45000,
    durationEstimate: 'Aprox. 2h',
    popular: false,
    badge: 'Duración Extrema',
    description: 'Pies impecables con brillo resistente a calzado cerrado, agua y arena por semanas.',
    features: ['Limpieza profunda de talones y cutícula', 'Exfoliación hidratante', 'Esmalte semipermanente de alta duración', 'Masaje relajante con cremas botánicas'],
    imageUrl: 'images/portfolio/work_9.jpg'
  },
  {
    id: 'mani-tradicional',
    name: 'Manicura Tradicional Rusa',
    category: 'manicura',
    basePrice: 25000,
    durationEstimate: '1h - 1.5h',
    popular: false,
    badge: 'Clásico Limpio',
    description: 'Limpieza profunda de cutícula con fresas de precisión, limado anatómico y esmaltado clásico.',
    features: ['Retiro de cutícula e impurezas', 'Exfoliación hidratante de manos', 'Esmaltado tradicional', 'Aceite nutritivo de cutícula'],
    imageUrl: 'images/portfolio/work_5.jpg'
  },
  {
    id: 'pedi-tradicional',
    name: 'Pedicura Tradicional Spa',
    category: 'pedicura',
    basePrice: 30000,
    durationEstimate: '1h - 1.5h',
    popular: false,
    badge: 'Cuidado Esencial',
    description: 'Cuidado completo para pies: exfoliación, retiro de asperezas, corte correctivo y esmalte tradicional.',
    features: ['Baño higienizante tibio', 'Eliminación de durezas y exfoliación profunda', 'Esmaltado clásico impecable', 'Hidratación profunda'],
    imageUrl: 'images/portfolio/work_9.jpg'
  }
];

export const INITIAL_HERO_STYLES: HeroFeaturedStyle[] = [
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

export const INITIAL_COMPLEXITY_LEVELS: NailComplexity[] = [
  {
    id: 'basic',
    title: 'Diseño Básico / Liso',
    subtitle: 'Color sólido o francés clásico',
    extraPrice: 0,
    extraTimeMinutes: 0,
    description: 'Unicolor, efecto perlado básico, o francesa tradicional sencilla.',
    imageUrl: 'images/portfolio/work_5.jpg'
  },
  {
    id: 'moderate',
    title: 'Diseño Intermedio',
    subtitle: 'Glitter, foil, líneas o stickers en 2-4 uñas',
    extraPrice: 15000,
    extraTimeMinutes: 30,
    description: 'Detalles a mano alzada moderados, trazos, degradados o efectos sencillos.',
    imageUrl: 'images/portfolio/work_2.jpg'
  },
  {
    id: 'complex',
    title: 'Nail Art Complejo / 3D & Chrome',
    subtitle: 'Relieves 3D, dijes metálicos, texturas y cristales',
    extraPrice: 35000,
    extraTimeMinutes: 60,
    description: 'Efecto cromo líquido Y2K, relieves con gel sólido 3D, pedrería, encapsulation o diseño temático.',
    imageUrl: 'images/portfolio/work_1.jpg'
  }
];

export const INITIAL_PRESS_ON_SETTINGS: PressOnSettings = {
  basePrice: 40000,
  depositPercent: 20,
  bannerImage: 'images/portfolio/work_4.jpg',
  shapes: [
    { id: 'almond', label: 'Almendra', imageUrl: 'images/portfolio/work_3.jpg' },
    { id: 'coffin', label: 'Coffin / Ballerina', imageUrl: 'images/portfolio/work_7.jpg' },
    { id: 'stiletto', label: 'Stiletto / Punta', imageUrl: 'images/portfolio/work_1.jpg' },
    { id: 'square', label: 'Cuadrada Clásica', imageUrl: 'images/portfolio/work_6.jpg' }
  ]
};

export const INITIAL_COTIZADOR_CONTENT: CotizadorContent = {
  badge: 'Cotizador Express sin Formularios Largos',
  title: 'Cotiza y Consulta Disponibilidad',
  subtitle: 'Elige lo que necesitas en 3 toques. Al finalizar, consultarás fechas y horarios directamente por WhatsApp.',
  depositNote: '* Para asegurar el cupo en tu puerta se solicita un abono del 20%.'
};

@Injectable({
  providedIn: 'root'
})
export class CatalogService {
  // Base de datos de servicios en memoria reactiva
  services = signal<NailService[]>(this.loadServices());

  // Showcase del Hero (Tendencia Y2K y estilos destacados)
  heroStyles = signal<HeroFeaturedStyle[]>(this.loadHeroStyles());

  // Niveles de complejidad del cotizador
  complexityLevels = signal<NailComplexity[]>(this.loadComplexityLevels());

  // Configuración de Sets Press-On
  pressOnSettings = signal<PressOnSettings>(this.loadPressOnSettings());

  // Textos y badges del cotizador
  cotizadorContent = signal<CotizadorContent>(this.loadCotizadorContent());

  // Sesión y modo editor de Administrador (Estilo Canva)
  isAdmin = signal<boolean>(this.checkSavedAuth());
  isEditMode = signal<boolean>(false);

  // Categoría activa para el catálogo
  selectedCategory = signal<string>('todos');

  // Servicios filtrados reactivamente
  filteredServices = computed(() => {
    const cat = this.selectedCategory();
    const list = this.services();
    if (cat === 'todos') {
      return list;
    }
    return list.filter(s => s.category === cat);
  });

  constructor() {
    if (this.isAdmin()) {
      this.isEditMode.set(true);
    }
  }

  // --- MÉTODOS DE BASE DE DATOS LOCAL: SERVICIOS ---

  private loadServices(): NailService[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Error leyendo servicios locales:', e);
    }
    return [...INITIAL_SERVICES];
  }

  private persistServices(list: NailService[]) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.error('Error guardando servicios locales:', e);
    }
  }

  getServices(): NailService[] {
    return this.services();
  }

  getServiceById(id: string): NailService | undefined {
    return this.services().find(s => s.id === id);
  }

  updateService(id: string, updates: Partial<NailService>) {
    this.services.update(list => {
      const updated = list.map(item => {
        if (item.id === id) {
          return { ...item, ...updates };
        }
        return item;
      });
      this.persistServices(updated);
      return updated;
    });
  }

  addService(newService: NailService) {
    this.services.update(list => {
      const updated = [newService, ...list];
      this.persistServices(updated);
      return updated;
    });
  }

  deleteService(id: string) {
    this.services.update(list => {
      const updated = list.filter(s => s.id !== id);
      this.persistServices(updated);
      return updated;
    });
  }

  // --- MÉTODOS DE BASE DE DATOS LOCAL: HERO STYLES (TENDENCIA Y2K) ---

  private loadHeroStyles(): HeroFeaturedStyle[] {
    try {
      const saved = localStorage.getItem(HERO_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Error leyendo hero styles:', e);
    }
    return [...INITIAL_HERO_STYLES];
  }

  private persistHeroStyles(list: HeroFeaturedStyle[]) {
    try {
      localStorage.setItem(HERO_STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.error('Error guardando hero styles:', e);
    }
  }

  updateHeroStyle(id: string, updates: Partial<HeroFeaturedStyle>) {
    this.heroStyles.update(list => {
      const updated = list.map(item => {
        if (item.id === id) {
          return { ...item, ...updates };
        }
        return item;
      });
      this.persistHeroStyles(updated);
      return updated;
    });
  }

  // --- MÉTODOS DE BASE DE DATOS LOCAL: COTIZADOR & PRESS-ON ---

  private loadComplexityLevels(): NailComplexity[] {
    try {
      const saved = localStorage.getItem(COMPLEXITY_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Error leyendo niveles de complejidad:', e);
    }
    return [...INITIAL_COMPLEXITY_LEVELS];
  }

  private persistComplexityLevels(list: NailComplexity[]) {
    try {
      localStorage.setItem(COMPLEXITY_STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.error('Error guardando niveles de complejidad:', e);
    }
  }

  updateComplexityLevel(id: string, updates: Partial<NailComplexity>) {
    this.complexityLevels.update(list => {
      const updated = list.map(item => {
        if (item.id === id) {
          return { ...item, ...updates };
        }
        return item;
      });
      this.persistComplexityLevels(updated);
      return updated;
    });
  }

  private loadPressOnSettings(): PressOnSettings {
    try {
      const saved = localStorage.getItem(PRESS_ON_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Error leyendo configuración de press on:', e);
    }
    return { ...INITIAL_PRESS_ON_SETTINGS };
  }

  private persistPressOnSettings(settings: PressOnSettings) {
    try {
      localStorage.setItem(PRESS_ON_STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Error guardando configuración de press on:', e);
    }
  }

  updatePressOnSettings(updates: Partial<PressOnSettings>) {
    this.pressOnSettings.update(curr => {
      const updated = { ...curr, ...updates };
      this.persistPressOnSettings(updated);
      return updated;
    });
  }

  updatePressOnShape(shapeId: string, updates: Partial<PressOnShape>) {
    this.pressOnSettings.update(curr => {
      const updatedShapes = curr.shapes.map(s => {
        if (s.id === shapeId) {
          return { ...s, ...updates };
        }
        return s;
      });
      const updated = { ...curr, shapes: updatedShapes };
      this.persistPressOnSettings(updated);
      return updated;
    });
  }

  private loadCotizadorContent(): CotizadorContent {
    try {
      const saved = localStorage.getItem(COTIZADOR_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Error leyendo textos del cotizador:', e);
    }
    return { ...INITIAL_COTIZADOR_CONTENT };
  }

  private persistCotizadorContent(content: CotizadorContent) {
    try {
      localStorage.setItem(COTIZADOR_STORAGE_KEY, JSON.stringify(content));
    } catch (e) {
      console.error('Error guardando textos del cotizador:', e);
    }
  }

  updateCotizadorContent(updates: Partial<CotizadorContent>) {
    this.cotizadorContent.update(curr => {
      const updated = { ...curr, ...updates };
      this.persistCotizadorContent(updated);
      return updated;
    });
  }

  resetToDefaults() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(HERO_STORAGE_KEY);
      localStorage.removeItem(COMPLEXITY_STORAGE_KEY);
      localStorage.removeItem(PRESS_ON_STORAGE_KEY);
      localStorage.removeItem(COTIZADOR_STORAGE_KEY);
    } catch {}
    this.services.set([...INITIAL_SERVICES]);
    this.persistServices([...INITIAL_SERVICES]);
    this.heroStyles.set([...INITIAL_HERO_STYLES]);
    this.persistHeroStyles([...INITIAL_HERO_STYLES]);
    this.complexityLevels.set([...INITIAL_COMPLEXITY_LEVELS]);
    this.persistComplexityLevels([...INITIAL_COMPLEXITY_LEVELS]);
    this.pressOnSettings.set({ ...INITIAL_PRESS_ON_SETTINGS });
    this.persistPressOnSettings({ ...INITIAL_PRESS_ON_SETTINGS });
    this.cotizadorContent.set({ ...INITIAL_COTIZADOR_CONTENT });
    this.persistCotizadorContent({ ...INITIAL_COTIZADOR_CONTENT });
  }

  async convertFileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
  }

  // --- MÉTODOS DE AUTENTICACIÓN Y MODO CANVA ---

  private checkSavedAuth(): boolean {
    try {
      return localStorage.getItem(AUTH_KEY) === 'true';
    } catch {
      return false;
    }
  }

  login(password: string): boolean {
    if (password.trim() === DEFAULT_PASSWORD) {
      this.isAdmin.set(true);
      this.isEditMode.set(true);
      try {
        localStorage.setItem(AUTH_KEY, 'true');
      } catch {}
      return true;
    }
    return false;
  }

  logout() {
    this.isAdmin.set(false);
    this.isEditMode.set(false);
    try {
      localStorage.removeItem(AUTH_KEY);
    } catch {}
  }

  toggleEditMode() {
    if (this.isAdmin()) {
      this.isEditMode.update(val => !val);
    }
  }

  formatPrice(price: number): string {
    const rounded = Math.round(price || 0);
    const formatted = rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `$${formatted} COP`;
  }
}
