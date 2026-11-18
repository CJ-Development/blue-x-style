import { Injectable, signal, computed } from '@angular/core';
import { NailService, NAIL_SERVICES } from '../models/service.model';

const STORAGE_KEY = 'bxs_services_db_v1';
const AUTH_KEY = 'bxs_admin_auth_v1';
const DEFAULT_PASSWORD = 'bluexstyle2026';

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

@Injectable({
  providedIn: 'root'
})
export class CatalogService {
  // Base de datos de servicios en memoria reactiva
  services = signal<NailService[]>(this.loadServices());

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
    // Si ya está logueado, inicia con el modo edición habilitado para comodidad
    if (this.isAdmin()) {
      this.isEditMode.set(true);
    }
  }

  // --- MÉTODOS DE BASE DE DATOS LOCAL ---

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
      console.warn('Error leyendo base de datos local:', e);
    }
    return [...INITIAL_SERVICES];
  }

  private persistServices(list: NailService[]) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.error('Error guardando en base de datos local:', e);
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

  resetToDefaults() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    this.services.set([...INITIAL_SERVICES]);
    this.persistServices([...INITIAL_SERVICES]);
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
