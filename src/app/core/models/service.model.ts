export interface NailService {
  id: string;
  name: string;
  category: 'manicura' | 'pedicura' | 'estructuras' | 'sistemas';
  basePrice: number;
  durationEstimate: string;
  description: string;
  features: string[];
  popular?: boolean;
  badge?: string;
}

export interface NailComplexity {
  id: 'basic' | 'moderate' | 'complex';
  title: string;
  subtitle: string;
  extraPrice: number;
  extraTimeMinutes: number;
  description: string;
}

export const NAIL_SERVICES: NailService[] = [
  {
    id: 'mani-tradicional',
    name: 'Manicura Tradicional',
    category: 'manicura',
    basePrice: 25000,
    durationEstimate: '1h - 1.5h',
    description: 'Limpieza profunda de cutícula, limado de forma anatómica y esmaltado clásico de alta duración.',
    features: ['Retiro de cutícula e impurezas', 'Exfoliación hidratante', 'Esmaltado tradicional', 'Aceite nutritivo']
  },
  {
    id: 'pedi-tradicional',
    name: 'Pedicura Tradicional',
    category: 'pedicura',
    basePrice: 30000,
    durationEstimate: '1h - 1.5h',
    description: 'Cuidado completo para pies: exfoliación, retiro de asperezas, corte correctivo y esmalte tradicional.',
    features: ['Baño higienizante', 'Eliminación de durezas y exfoliación', 'Esmaltado impecable']
  },
  {
    id: 'mani-semi',
    name: 'Manicura Semipermanente',
    category: 'manicura',
    basePrice: 50000,
    durationEstimate: 'Aprox. 2h',
    popular: true,
    badge: 'Más Solicitado',
    description: 'Esmaltado curado en lámpara LED/UV con brillo espejo que dura hasta 21 días intacto.',
    features: ['Preparación rusa/combinada de uña', 'Base niveladora protectora', 'Color ultra brillante sin desprendimientos', 'Secado instantáneo en lámpara']
  },
  {
    id: 'pedi-semi',
    name: 'Pedicura Semipermanente',
    category: 'pedicura',
    basePrice: 45000,
    durationEstimate: 'Aprox. 2h',
    description: 'Pies impecables con brillo resistente a calzado cerrado, agua y arena por semanas.',
    features: ['Limpieza profunda de talones y cutícula', 'Esmalte semipermanente de larga duración', 'Masaje relajante']
  },
  {
    id: 'dipping-rubber-polygel',
    name: 'Nivelación Rubber / Dipping / Recubrimiento',
    category: 'estructuras',
    basePrice: 60000,
    durationEstimate: 'Hasta 3h',
    popular: true,
    badge: 'Estructura Fuerte',
    description: 'Ideal para uñas débiles o quebradizas. Brinda fuerza, curvatura perfecta y crecimiento natural.',
    features: ['Base Rubber o Dipping reforzado', 'Recubrimiento protector en Polygel', 'Nivelación de superficie cóncava/estriada', 'Acabado ultra natural y resistente']
  },
  {
    id: 'sistemas-artificiales',
    name: 'Sistemas Artificiales (Softgel / Polygel)',
    category: 'sistemas',
    basePrice: 90000,
    durationEstimate: '3h o más',
    badge: 'Extensiones Top',
    description: 'Extensiones esculpidas a medida con tips de gel completo o polygel moldeado. Máxima resistencia y estética.',
    features: ['Largo y forma deseada (Almendra, Coffin, Stiletto)', 'Estructura ligera pero irrompible', 'Preparación premium sin daño a la uña natural', 'Apto para Nail Art de alta complejidad']
  }
];

export const COMPLEXITY_LEVELS: NailComplexity[] = [
  {
    id: 'basic',
    title: 'Diseño Básico / Liso',
    subtitle: 'Color sólido o francés clásico',
    extraPrice: 0,
    extraTimeMinutes: 0,
    description: 'Unicolor, efecto perlado básico, o francesa tradicional sencilla.'
  },
  {
    id: 'moderate',
    title: 'Diseño Intermedio',
    subtitle: 'Glitter, foil, líneas o stickers en 2-4 uñas',
    extraPrice: 15000,
    extraTimeMinutes: 30,
    description: 'Detalles a mano alzada moderados, trazos, degradados o efectos sencillos.'
  },
  {
    id: 'complex',
    title: 'Nail Art Complejo / 3D & Chrome',
    subtitle: 'Relieves 3D, dijes metálicos, texturas y cristales',
    extraPrice: 35000,
    extraTimeMinutes: 60,
    description: 'Efecto cromo líquido Y2K, relieves con gel sólido 3D, pedrería, encapsulation o diseño temático.'
  }
];
