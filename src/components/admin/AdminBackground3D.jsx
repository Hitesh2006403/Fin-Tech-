import React, { useEffect, useRef } from 'react';

/**
 * AdminBackground3D
 * Professional, calm, restrained 3D background designed specifically for the FinSight Admin Portal:
 * - Contrasting Obsidian-Charcoal / Titanium Slate atmospheric base (#080C14 - #0D131F)
 * - Soft, slow ambient illumination (subtle executive sapphire/indigo glow, low opacity)
 * - Single restrained geometric glass element with very slow, gentle drift
 * - Sparse, minimalist micro-particles (low count, slow movement)
 * - Responsive subtle mouse parallax with smooth lerp
 * - Fully accessible (disables motion on prefers-reduced-motion)
 * - Zero pointer-events interference
 */
export function AdminBackground3D() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const mousePos = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const handleMouseMove = (e) => {
      if (prefersReducedMotion) return;
      const { innerWidth, innerHeight } = window;
      mousePos.current.targetX = (e.clientX / innerWidth - 0.5) * 1.5;
      mousePos.current.targetY = (e.clientY / innerHeight - 0.5) * 1.5;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Very sparse particle pool (max 18 particles) for calm, restrained enterprise feel
    const particleCount = prefersReducedMotion ? 0 : Math.min(18, Math.floor((width * height) / 60000));
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.2 + 0.5,
      speedX: (Math.random() - 0.5) * 0.12,
      speedY: -Math.random() * 0.18 - 0.05,
      alpha: Math.random() * 0.25 + 0.08,
      color: 'rgba(99, 102, 241, '
    }));

    const render = () => {
      mousePos.current.x += (mousePos.current.targetX - mousePos.current.x) * 0.03;
      mousePos.current.y += (mousePos.current.targetY - mousePos.current.y) * 0.03;

      const px = mousePos.current.x;
      const py = mousePos.current.y;

      if (containerRef.current && !prefersReducedMotion) {
        containerRef.current.style.setProperty('--admin-mouse-px', `${px * 10}px`);
        containerRef.current.style.setProperty('--admin-mouse-py', `${py * 10}px`);
      }

      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        if (!prefersReducedMotion) {
          p.x += p.speedX;
          p.y += p.speedY;

          if (p.y < -10) {
            p.y = height + 10;
            p.x = Math.random() * width;
          }
          if (p.x < -10) p.x = width + 10;
          if (p.x > width + 10) p.x = -10;
        }

        const renderX = p.x + px * 6;
        const renderY = p.y + py * 6;

        ctx.beginPath();
        ctx.arc(renderX, renderY, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${p.alpha})`;
        ctx.fill();
      }

      if (!prefersReducedMotion) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="admin-3d-bg"
      aria-hidden="true"
    >
      {/* 1. Deep Obsidian-Charcoal Atmospheric Gradient Base */}
      <div className="admin-bg-base" />

      {/* 2. Soft, Calm Ambient Illumination (Restrained Executive Indigo & Slate) */}
      <div className="admin-ambient-orb admin-orb-top" />
      <div className="admin-ambient-orb admin-orb-bottom" />

      {/* 3. Single Restrained Geometric Obsidian Glass Element */}
      <div className="admin-geometry-layer">
        <div className="admin-glass-prism">
          <div className="admin-prism-sheen" />
        </div>
      </div>

      {/* 4. Canvas for sparse particles */}
      <canvas ref={canvasRef} className="admin-particles-canvas" />

      {/* 5. Subtle Vignette */}
      <div className="admin-bg-vignette" />
    </div>
  );
}
