import { useEffect, useRef } from 'react';

interface GoldenParticlesProps {
  active: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  rotSpeed: number;
  opacity: number;
  type: 'circle' | 'star' | 'sparkle';
}

export function GoldenParticles({ active }: GoldenParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Particle[] = [];
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: -Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 3,
        vy: Math.random() * 4 + 2,
        size: Math.random() * 8 + 3,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.15,
        opacity: Math.random() * 0.5 + 0.5,
        type: ['circle', 'star', 'sparkle'][Math.floor(Math.random() * 3)] as Particle['type'],
      });
    }

    const drawStar = (cx: number, cy: number, size: number, rot: number) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rot);
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
        const method = i === 0 ? 'moveTo' : 'lineTo';
        ctx[method](Math.cos(angle) * size, Math.sin(angle) * size);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    const drawSparkle = (cx: number, cy: number, size: number, rot: number) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rot);
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        const angle = (i * Math.PI) / 2;
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(angle) * size, Math.sin(angle) * size);
        ctx.stroke();
      }
      ctx.restore();
    };

    const loop = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotSpeed;
        p.vy += 0.05; // gravity

        if (p.y > canvas.height + 20) {
          p.y = -20;
          p.x = Math.random() * canvas.width;
          p.vy = Math.random() * 4 + 2;
        }

        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2);
        gradient.addColorStop(0, `rgba(255, 215, 0, ${p.opacity})`);
        gradient.addColorStop(0.5, `rgba(255, 180, 0, ${p.opacity * 0.6})`);
        gradient.addColorStop(1, `rgba(255, 140, 0, 0)`);

        ctx.fillStyle = gradient;
        ctx.strokeStyle = `rgba(255, 215, 0, ${p.opacity * 0.8})`;
        ctx.lineWidth = 1.5;
        ctx.shadowColor = 'rgba(255, 215, 0, 0.8)';
        ctx.shadowBlur = 15;

        if (p.type === 'circle') {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.type === 'star') {
          ctx.fillStyle = `rgba(255, 215, 0, ${p.opacity})`;
          drawStar(p.x, p.y, p.size, p.rotation);
        } else {
          drawSparkle(p.x, p.y, p.size * 1.5, p.rotation);
        }

        ctx.shadowBlur = 0;
      });

      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(animRef.current);
  }, [active]);

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-40 pointer-events-none"
      style={{ width: '100vw', height: '100vh' }}
    />
  );
}
