import { useEffect, useRef } from 'react';

const COLORS = ['#ffd166', '#ef476f', '#06d6a0', '#8b7bff', '#4cc9f0', '#ff9f1c'];
const DURATION_MS = 6000;
const GRAVITY = 0.04;

/**
 * Fogos de artifício em canvas por cima da tela, sem bloquear cliques.
 * Dispara por alguns segundos e para; respeita "reduzir movimento".
 */
export default function Fireworks() {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let width = 0;
    let height = 0;

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    const rockets = [];
    const sparks = [];
    const start = performance.now();
    let lastLaunch = 0;
    let frame;

    const launch = () => {
      rockets.push({
        x: width * (0.15 + Math.random() * 0.7),
        y: height,
        vy: -(height * 0.011 + Math.random() * 3),
        targetY: height * (0.15 + Math.random() * 0.3),
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      });
    };

    const explode = (x, y, color) => {
      const count = 50 + Math.floor(Math.random() * 30);
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count;
        const speed = 1.5 + Math.random() * 3;
        sparks.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          decay: 0.012 + Math.random() * 0.012,
          color: Math.random() < 0.2 ? '#ffffff' : color,
        });
      }
    };

    const tick = (now) => {
      const elapsed = now - start;
      if (elapsed < DURATION_MS && now - lastLaunch > 350 + Math.random() * 400) {
        launch();
        lastLaunch = now;
      }

      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'lighter';

      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];
        r.y += r.vy;
        ctx.fillStyle = r.color;
        ctx.beginPath();
        ctx.arc(r.x, r.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
        if (r.y <= r.targetY) {
          explode(r.x, r.y, r.color);
          rockets.splice(i, 1);
        }
      }

      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.vx *= 0.98;
        s.vy = s.vy * 0.98 + GRAVITY;
        s.x += s.vx;
        s.y += s.vy;
        s.life -= s.decay;
        if (s.life <= 0) {
          sparks.splice(i, 1);
          continue;
        }
        ctx.globalAlpha = s.life;
        ctx.fillStyle = s.color;
        ctx.beginPath();
        ctx.arc(s.x, s.y, 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = 'source-over';

      if (elapsed < DURATION_MS || rockets.length || sparks.length) {
        frame = requestAnimationFrame(tick);
      } else {
        ctx.clearRect(0, 0, width, height);
      }
    };
    frame = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="fireworks-canvas" aria-hidden="true" />;
}
