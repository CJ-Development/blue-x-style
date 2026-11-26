import {
  Component,
  ElementRef,
  OnInit,
  OnDestroy,
  ViewChild,
  inject,
  PLATFORM_ID
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ThemeService } from '../../../core/services/theme.service';

type BlossomPhase = 'falling' | 'resting' | 'fading';

interface FallingBlossom {
  kind: 'flower' | 'petal';
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  petalCount: number;
  rotation: number;
  rotSpeed: number;
  swayPhase: number;
  swayFreq: number;
  swayAmp: number;
  flipPhase: number;
  flipSpeed: number;
  paletteIndex: number;
  depth: number; // 0.65..1.0
  alpha: number;
  maxAlpha: number;
  phase: BlossomPhase;
  restAge: number;
  restDuration: number;
  fadeProgress: number; // 0 -> 1
  landingY: number;
  pileBucket: number;
  pileContribution: number;
  scale: number;
}

interface AmbientSparkle {
  x: number;
  y: number;
  vy: number;
  radius: number;
  alpha: number;
  phase: number;
  paletteIndex: number;
}

interface FlowerPalette {
  petalBase: string;
  petalMid: string;
  petalTip: string;
  petalStroke: string;
  centerGlow: string;
  stamen: string;
}

const DARK_PALETTES: FlowerPalette[] = [
  {
    petalBase: 'rgba(24, 96, 148, 0.56)',
    petalMid: 'rgba(56, 189, 248, 0.44)',
    petalTip: 'rgba(230, 243, 251, 0.68)',
    petalStroke: 'rgba(155, 199, 230, 0.42)',
    centerGlow: 'rgba(0, 212, 255, 0.82)',
    stamen: 'rgba(247, 253, 254, 0.92)'
  },
  {
    petalBase: 'rgba(14, 116, 144, 0.52)',
    petalMid: 'rgba(0, 212, 255, 0.38)',
    petalTip: 'rgba(224, 242, 254, 0.66)',
    petalStroke: 'rgba(125, 211, 252, 0.38)',
    centerGlow: 'rgba(125, 211, 252, 0.78)',
    stamen: 'rgba(255, 255, 255, 0.92)'
  },
  {
    petalBase: 'rgba(59, 104, 188, 0.46)',
    petalMid: 'rgba(155, 199, 230, 0.42)',
    petalTip: 'rgba(247, 253, 254, 0.64)',
    petalStroke: 'rgba(191, 219, 254, 0.38)',
    centerGlow: 'rgba(147, 197, 253, 0.78)',
    stamen: 'rgba(240, 249, 255, 0.90)'
  }
];

const LIGHT_PALETTES: FlowerPalette[] = [
  {
    petalBase: 'rgba(20, 85, 130, 0.32)',
    petalMid: 'rgba(56, 189, 248, 0.28)',
    petalTip: 'rgba(224, 242, 254, 0.56)',
    petalStroke: 'rgba(20, 85, 130, 0.28)',
    centerGlow: 'rgba(28, 107, 160, 0.55)',
    stamen: 'rgba(255, 255, 255, 0.94)'
  },
  {
    petalBase: 'rgba(2, 132, 199, 0.28)',
    petalMid: 'rgba(125, 211, 252, 0.32)',
    petalTip: 'rgba(240, 249, 255, 0.58)',
    petalStroke: 'rgba(2, 132, 199, 0.25)',
    centerGlow: 'rgba(56, 189, 248, 0.58)',
    stamen: 'rgba(255, 255, 255, 0.94)'
  },
  {
    petalBase: 'rgba(37, 99, 235, 0.24)',
    petalMid: 'rgba(147, 197, 253, 0.30)',
    petalTip: 'rgba(255, 255, 255, 0.58)',
    petalStroke: 'rgba(37, 99, 235, 0.24)',
    centerGlow: 'rgba(59, 130, 246, 0.48)',
    stamen: 'rgba(255, 255, 255, 0.94)'
  }
];

@Component({
  selector: 'app-botanical-background',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="botanical-bg-layer" aria-hidden="true">
      <canvas #botanicalCanvas class="botanical-canvas"></canvas>
    </div>
  `,
  styles: [`
    .botanical-bg-layer {
      position: fixed;
      inset: 0;
      z-index: 0;
      pointer-events: none;
      overflow: hidden;
    }

    .botanical-canvas {
      display: block;
      width: 100%;
      height: 100%;
    }
  `]
})
export class BotanicalBackgroundComponent implements OnInit, OnDestroy {
  @ViewChild('botanicalCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private platformId = inject(PLATFORM_ID);
  private themeService = inject(ThemeService);

  private ctx: CanvasRenderingContext2D | null = null;
  private rafId: number | null = null;
  private blossoms: FallingBlossom[] = [];
  private sparkles: AmbientSparkle[] = [];
  private pileHeights: number[] = [];
  private readonly pileBucketCount = 36;
  private readonly maxPileHeight = 56;

  private width = 0;
  private height = 0;
  private lastTime = 0;
  private lastScrollY = 0;
  private windGust = 0;
  private reducedMotion = false;

  private resizeHandler = () => this.handleResize();
  private scrollHandler = () => {
    const currentY = window.scrollY || 0;
    const delta = currentY - this.lastScrollY;
    this.lastScrollY = currentY;
    // Brisa sutil cuando el usuario hace scroll
    this.windGust = Math.max(-28, Math.min(28, this.windGust + delta * 0.08));
  };

  ngOnInit() {
    if (!isPlatformBrowser(this.platformId)) return;

    this.reducedMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d');
    if (!this.ctx) return;

    this.handleResize();
    this.initRain();

    window.addEventListener('resize', this.resizeHandler, { passive: true });
    window.addEventListener('scroll', this.scrollHandler, { passive: true });

    if (this.reducedMotion) {
      this.renderFrame(0);
    } else {
      this.lastTime = performance.now();
      this.loop(this.lastTime);
    }
  }

  ngOnDestroy() {
    if (!isPlatformBrowser(this.platformId)) return;
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
    window.removeEventListener('resize', this.resizeHandler);
    window.removeEventListener('scroll', this.scrollHandler);
  }

  private handleResize() {
    const canvas = this.canvasRef.nativeElement;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    canvas.width = Math.floor(this.width * dpr);
    canvas.height = Math.floor(this.height * dpr);
    if (this.ctx) {
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    if (this.pileHeights.length !== this.pileBucketCount) {
      this.pileHeights = new Array(this.pileBucketCount).fill(0);
    }
  }

  private initRain() {
    this.pileHeights = new Array(this.pileBucketCount).fill(0);
    const isMobile = this.width < 768;
    const totalCount = isMobile ? 28 : 56;

    this.blossoms = Array.from({ length: totalCount }, (_, i) => {
      const b = this.spawnBlossom(true);
      // Distribuir inicialmente en toda la altura para que la lluvia sea visible desde el primer segundo
      b.y = -40 + (i / totalCount) * (this.height + 20);
      return b;
    });

    const sparkleCount = isMobile ? 14 : 26;
    this.sparkles = Array.from({ length: sparkleCount }, () => ({
      x: Math.random() * this.width,
      y: this.height - Math.random() * 140,
      vy: -(10 + Math.random() * 18),
      radius: 1.1 + Math.random() * 1.9,
      alpha: 0.15 + Math.random() * 0.35,
      phase: Math.random() * Math.PI * 2,
      paletteIndex: Math.floor(Math.random() * 3)
    }));
  }

  private spawnBlossom(initial = false): FallingBlossom {
    const depth = 0.65 + Math.random() * 0.35;
    const isFullFlower = Math.random() > 0.38; // 62% flores completas, 38% pétalos sueltos
    const radius = isFullFlower
      ? (11 + Math.random() * 13) * depth
      : (7 + Math.random() * 7) * depth;

    return {
      kind: isFullFlower ? 'flower' : 'petal',
      x: Math.random() * this.width,
      y: initial ? Math.random() * this.height : -(24 + Math.random() * 90),
      vx: (Math.random() - 0.5) * 10,
      vy: (24 + Math.random() * 28) * depth,
      radius,
      petalCount: 5 + Math.floor(Math.random() * 3), // 5..7 pétalos
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.9,
      swayPhase: Math.random() * Math.PI * 2,
      swayFreq: 0.7 + Math.random() * 0.85,
      swayAmp: (14 + Math.random() * 20) * depth,
      flipPhase: Math.random() * Math.PI * 2,
      flipSpeed: 0.9 + Math.random() * 1.2,
      paletteIndex: Math.floor(Math.random() * 3),
      depth,
      alpha: 0,
      maxAlpha: (0.48 + Math.random() * 0.34) * depth,
      phase: 'falling',
      restAge: 0,
      restDuration: 5.5 + Math.random() * 6.5,
      fadeProgress: 0,
      landingY: this.height - 12,
      pileBucket: 0,
      pileContribution: 0,
      scale: 1
    };
  }

  private getBucketIndex(x: number): number {
    const ratio = Math.max(0, Math.min(0.999, x / Math.max(1, this.width)));
    return Math.floor(ratio * this.pileBucketCount);
  }

  private addToPile(bucket: number, amount: number) {
    const clampAdd = (idx: number, val: number) => {
      if (idx < 0 || idx >= this.pileBucketCount) return;
      this.pileHeights[idx] = Math.min(this.maxPileHeight, this.pileHeights[idx] + val);
    };
    clampAdd(bucket, amount);
    clampAdd(bucket - 1, amount * 0.48);
    clampAdd(bucket + 1, amount * 0.48);
  }

  private removeFromPile(bucket: number, amount: number) {
    const clampSub = (idx: number, val: number) => {
      if (idx < 0 || idx >= this.pileBucketCount) return;
      this.pileHeights[idx] = Math.max(0, this.pileHeights[idx] - val);
    };
    clampSub(bucket, amount);
    clampSub(bucket - 1, amount * 0.48);
    clampSub(bucket + 1, amount * 0.48);
  }

  private loop = (now: number) => {
    const dt = Math.min(0.05, (now - this.lastTime) / 1000);
    this.lastTime = now;

    this.update(dt, now * 0.001);
    this.renderFrame(now * 0.001);

    this.rafId = requestAnimationFrame(this.loop);
  };

  private update(dt: number, timeSec: number) {
    // Decaimiento suave de la brisa por scroll
    this.windGust *= Math.pow(0.18, dt);

    for (let i = 0; i < this.blossoms.length; i++) {
      const b = this.blossoms[i];

      if (b.phase === 'falling') {
        // Aparición progresiva al entrar por arriba
        b.alpha = Math.min(b.maxAlpha, b.alpha + dt * 0.75);

        const swayX = Math.sin(timeSec * b.swayFreq + b.swayPhase) * b.swayAmp;
        b.x += (b.vx + swayX + this.windGust * b.depth) * dt;
        b.y += b.vy * dt;
        b.rotation += b.rotSpeed * dt;
        b.flipPhase += b.flipSpeed * dt;

        // Envolver suavemente si sale por los laterales
        if (b.x < -30) b.x = this.width + 25;
        if (b.x > this.width + 30) b.x = -25;

        // Calcular altura actual del lecho acumulado en la zona inferior
        const bucket = this.getBucketIndex(b.x);
        const currentPile = this.pileHeights[bucket] || 0;
        const targetGroundY = this.height - 10 - currentPile - b.radius * 0.35;

        if (b.y >= targetGroundY) {
          b.phase = 'resting';
          b.landingY = targetGroundY;
          b.pileBucket = bucket;
          b.pileContribution = b.kind === 'flower' ? 5.2 : 2.6;
          this.addToPile(bucket, b.pileContribution);
          b.restAge = 0;
        }
      } else if (b.phase === 'resting') {
        // Asentamiento sedoso y leve respiración en la cama floral inferior
        b.y += (b.landingY - b.y) * Math.min(1, dt * 5);
        b.rotSpeed *= Math.pow(0.05, dt);
        b.rotation += b.rotSpeed * dt;
        // Estabilizar volteo 3D suavemente para reposar con gracia
        b.flipPhase += (0 - Math.sin(b.flipPhase)) * Math.min(1, dt * 2.5);
        b.restAge += dt;

        if (b.restAge >= b.restDuration) {
          b.phase = 'fading';
          b.fadeProgress = 0;
        }
      } else if (b.phase === 'fading') {
        // Desvanecimiento fluido y suave durante ~3.2s
        b.fadeProgress = Math.min(1, b.fadeProgress + dt / 3.2);
        const smoothFade = 1 - this.easeInOutSine(b.fadeProgress);
        b.alpha = b.maxAlpha * smoothFade;
        b.scale = 0.8 + 0.2 * smoothFade;
        // Flota un par de píxeles al disolverse como polvo de luz
        b.y -= dt * 4.5;

        if (b.fadeProgress >= 1) {
          this.removeFromPile(b.pileBucket, b.pileContribution);
          this.blossoms[i] = this.spawnBlossom(false);
        }
      }
    }

    // Destellos de luz suaves que nacen desde el lecho inferior
    for (const s of this.sparkles) {
      s.phase += dt * 1.6;
      s.y += s.vy * dt;
      s.x += Math.sin(s.phase) * 6 * dt;
      if (s.y < this.height * 0.45) {
        s.y = this.height - Math.random() * 35;
        s.x = Math.random() * this.width;
      }
    }
  }

  private easeInOutSine(t: number): number {
    return -(Math.cos(Math.PI * t) - 1) / 2;
  }

  private renderFrame(timeSec: number) {
    const ctx = this.ctx;
    if (!ctx) return;

    ctx.clearRect(0, 0, this.width, this.height);
    const isLight = this.themeService.theme() === 'light';
    const palettes = isLight ? LIGHT_PALETTES : DARK_PALETTES;

    // 1. Halo ambiental suave en el borde inferior donde se acumulan las flores
    const bedGrad = ctx.createLinearGradient(0, this.height - 110, 0, this.height);
    bedGrad.addColorStop(0, 'rgba(0, 212, 255, 0)');
    bedGrad.addColorStop(
      1,
      isLight ? 'rgba(56, 189, 248, 0.08)' : 'rgba(0, 212, 255, 0.09)'
    );
    ctx.fillStyle = bedGrad;
    ctx.fillRect(0, this.height - 110, this.width, 110);

    // 2. Motas luminosas ascendiendo suavemente desde las flores acumuladas
    for (const sp of this.sparkles) {
      const palette = palettes[sp.paletteIndex];
      const twinkle = 0.5 + 0.5 * Math.sin(sp.phase * 1.9);
      const heightFade = Math.max(0, Math.min(1, (sp.y - this.height * 0.45) / (this.height * 0.45)));
      ctx.save();
      ctx.globalAlpha = sp.alpha * twinkle * heightFade;
      ctx.fillStyle = palette.centerGlow;
      ctx.beginPath();
      ctx.arc(sp.x, sp.y, sp.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 3. Dibujar primero las que reposan/se desvanecen en el fondo, y encima las que van cayendo
    for (const b of this.blossoms) {
      if (b.phase !== 'falling' && b.alpha > 0.005) {
        this.drawBlossom(ctx, b, palettes[b.paletteIndex], isLight);
      }
    }
    for (const b of this.blossoms) {
      if (b.phase === 'falling' && b.alpha > 0.005) {
        this.drawBlossom(ctx, b, palettes[b.paletteIndex], isLight);
      }
    }
  }

  private drawBlossom(
    ctx: CanvasRenderingContext2D,
    b: FallingBlossom,
    palette: FlowerPalette,
    isLight: boolean
  ) {
    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.rotate(b.rotation);

    // Sutil efecto de perspectiva al flotar o reposar en el fondo
    const tiltY =
      b.phase === 'falling'
        ? 0.68 + 0.32 * Math.cos(b.flipPhase)
        : 0.72;
    ctx.scale(b.scale, b.scale * tiltY);
    ctx.globalAlpha = b.alpha;

    if (b.kind === 'petal') {
      this.drawSinglePetal(ctx, 0, b.radius * 1.45, b.radius * 0.62, palette);
    } else {
      const r = b.radius;
      const petalW = r * 0.44;

      // Aura sutil
      const aura = ctx.createRadialGradient(0, 0, 1, 0, 0, r * 1.35);
      aura.addColorStop(0, isLight ? 'rgba(56, 189, 248, 0.14)' : 'rgba(0, 212, 255, 0.2)');
      aura.addColorStop(1, 'rgba(0, 212, 255, 0)');
      ctx.fillStyle = aura;
      ctx.beginPath();
      ctx.arc(0, 0, r * 1.35, 0, Math.PI * 2);
      ctx.fill();

      // Capa exterior de pétalos
      for (let i = 0; i < b.petalCount; i++) {
        const a = (i / b.petalCount) * Math.PI * 2;
        this.drawSinglePetal(ctx, a, r, petalW, palette);
      }

      // Capa interior delicada
      const innerR = r * 0.56;
      const innerW = petalW * 0.65;
      const offset = Math.PI / b.petalCount;
      for (let i = 0; i < b.petalCount; i++) {
        const a = (i / b.petalCount) * Math.PI * 2 + offset;
        this.drawSinglePetal(ctx, a, innerR, innerW, palette);
      }

      // Centro luminoso perla
      const coreR = Math.max(1.8, r * 0.16);
      const core = ctx.createRadialGradient(0, 0, 0, 0, 0, coreR * 2.1);
      core.addColorStop(0, palette.stamen);
      core.addColorStop(0.55, palette.centerGlow);
      core.addColorStop(1, 'rgba(0, 212, 255, 0)');
      ctx.fillStyle = core;
      ctx.beginPath();
      ctx.arc(0, 0, coreR * 2.1, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  private drawSinglePetal(
    ctx: CanvasRenderingContext2D,
    angle: number,
    length: number,
    width: number,
    palette: FlowerPalette
  ) {
    ctx.save();
    ctx.rotate(angle);

    const grad = ctx.createLinearGradient(0, 0, length, 0);
    grad.addColorStop(0, palette.petalBase);
    grad.addColorStop(0.55, palette.petalMid);
    grad.addColorStop(1, palette.petalTip);

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(
      length * 0.3, -width,
      length * 0.85, -width * 0.62,
      length, 0
    );
    ctx.bezierCurveTo(
      length * 0.85, width * 0.62,
      length * 0.3, width,
      0, 0
    );
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.strokeStyle = palette.petalStroke;
    ctx.lineWidth = 0.65;
    ctx.stroke();

    ctx.restore();
  }
}
