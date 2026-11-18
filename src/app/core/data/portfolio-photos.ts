export interface PortfolioItem {
  id: string;
  title: string;
  category: string;
  shape: string;
  length: string;
  technique: string;
  imageUrl: string;
  featured: boolean;
}

export const PORTFOLIO_ITEMS: PortfolioItem[] = [
  {
    id: 'chrome-star-y2k',
    title: 'Liquid Chrome Y2K & Relieve Tridimensional',
    category: 'Cromo & Y2K',
    shape: 'Almendra',
    length: 'Larga',
    technique: 'Polygel + Cromo Espejo + Relieve 3D',
    imageUrl: 'images/portfolio/work_1.jpg',
    featured: true
  },
  {
    id: 'cateye-sapphire',
    title: 'Cat Eye 9D Magnético Azul Zafiro Galáctico',
    category: 'Cat Eye',
    shape: 'Coffin',
    length: 'Mediana',
    technique: 'Base Rubber + Pigmento Magnético 9D',
    imageUrl: 'images/portfolio/work_2.jpg',
    featured: true
  },
  {
    id: 'cyber-gothic-chrome',
    title: 'Cyberpunk Chrome & Gotas Líquidas',
    category: 'Cromo & Y2K',
    shape: 'Stiletto',
    length: 'Extra Larga',
    technique: 'Esculpido Polygel + Gotas 3D Moldeadas',
    imageUrl: 'images/portfolio/work_3.jpg',
    featured: true
  },
  {
    id: 'aura-baby-blue',
    title: 'Aura Electric Blue & Micro-Glitters',
    category: 'Aura & Art',
    shape: 'Almendra',
    length: 'Mediana',
    technique: 'Aerógrafo Nail Art + Top Gloss Espejo',
    imageUrl: 'images/portfolio/work_4.jpg',
    featured: true
  },
  {
    id: 'french-metallic-luxe',
    title: 'Micro-French Cromado Plata & Base Nude',
    category: 'Elegancia & Nude',
    shape: 'Cuadrada',
    length: 'Corta',
    technique: 'Nivelación Rubber Base + Líneas Finas Cromo',
    imageUrl: 'images/portfolio/work_5.jpg',
    featured: false
  },
  {
    id: 'presson-y2k-collection',
    title: 'Press-On Set: Y2K Chrome Cyber Edition',
    category: 'Press-On Sets',
    shape: 'Almendra',
    length: 'Larga',
    technique: '100% Hecho a Mano Reutilizable (10 tips)',
    imageUrl: 'images/portfolio/work_6.jpg',
    featured: true
  },
  {
    id: 'relief-charms-silver',
    title: 'Relieves 3D Orgánicos & Dijes Plateados',
    category: '3D Nail Art',
    shape: 'Coffin',
    length: 'Larga',
    technique: 'Gel de Construcción Tridimensional',
    imageUrl: 'images/portfolio/work_7.jpg',
    featured: false
  },
  {
    id: 'milky-luxury-glaze',
    title: 'Milky Glaze Opalino con Destellos Celestes',
    category: 'Elegancia & Nude',
    shape: 'Almendra',
    length: 'Corta',
    technique: 'Rubber Nivelada + Efecto Glaseado',
    imageUrl: 'images/portfolio/work_8.jpg',
    featured: false
  },
  {
    id: 'presson-coffin-cateye',
    title: 'Press-On Set: Cat Eye Zafiro Profundo',
    category: 'Press-On Sets',
    shape: 'Coffin',
    length: 'Mediana',
    technique: 'Tips Gel-X Reutilizables + Kit de Aplicación',
    imageUrl: 'images/portfolio/work_9.jpg',
    featured: false
  },
  {
    id: 'black-chrome-accents',
    title: 'Black Velvet & Micro-Borders Cromados',
    category: 'Cromo & Y2K',
    shape: 'Stiletto',
    length: 'Larga',
    technique: 'Polygel + Delineado Cromo Fino',
    imageUrl: 'images/portfolio/work_10.jpg',
    featured: false
  },
  {
    id: 'nude-rubber-perfection',
    title: 'Manicura Rusa Impecable + Rubber Nivelada',
    category: 'Elegancia & Nude',
    shape: 'Cuadrada',
    length: 'Corta',
    technique: 'Corte de Cutícula en Seco + Nivelación',
    imageUrl: 'images/portfolio/work_11.jpg',
    featured: false
  },
  {
    id: 'futuristic-gemstones',
    title: 'Incrustaciones de Cristales & Metal Líquido',
    category: '3D Nail Art',
    shape: 'Almendra',
    length: 'Extra Larga',
    technique: 'Joyería de Uñas + Encapsulado en Gel',
    imageUrl: 'images/portfolio/work_12.jpg',
    featured: false
  }
];
