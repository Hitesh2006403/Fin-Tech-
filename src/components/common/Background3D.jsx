import React, { useEffect, useRef } from 'react';

/**
 * Background3D
 * Premium 3D-inspired animated background for Fintech Treasury:
 * - Layered midnight navy & deep blue atmosphere
 * - Slowly floating translucent glass spheres with specular highlights
 * - 3D glass geometric rings with smooth continuous rotation
 * - Ambient cyan & violet ambient light orbs
 * - Lightweight canvas for subtle floating micro-particles
 * - Responsive mouse parallax with smooth lerp
 * - Fully accessible (respects prefers-reduced-motion)
 * - Zero pointer-event interference (pointer-events: none)
 */
export function Background3D() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const mousePos = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  useEffect(() => {
    // Check reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Mouse movement listener for smooth parallax on desktop
    const handleMouseMove = (e) => {
      if (prefersReducedMotion) return;
      const { innerWidth, innerHeight } = window;
      // Normalized between -1 and 1
      mousePos.current.targetX = (e.clientX / innerWidth - 0.5) * 2;
      mousePos.current.targetY = (e.clientY / innerHeight - 0.5) * 2;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    // Canvas particle constellation setup
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

    // Particle pool - restrained count for maximum performance
    const particleCount = Math.min(45, Math.floor((width * height) / 32000));
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.6 + 0.6,
      speedX: (Math.random() - 0.5) * 0.25,
      speedY: -Math.random() * 0.35 - 0.1,
      alpha: Math.random() * 0.45 + 0.15,
      color: Math.random() > 0.4 ? 'rgba(56, 189, 248, ' : 'rgba(167, 139, 250, '
    }));

    const render = () => {
      // Smooth lerp for mouse parallax
      mousePos.current.x += (mousePos.current.targetX - mousePos.current.x) * 0.04;
      mousePos.current.y += (mousePos.current.targetY - mousePos.current.y) * 0.04;

      const px = mousePos.current.x;
      const py = mousePos.current.y;

      // Update CSS parallax variables on container
      if (containerRef.current && !prefersReducedMotion) {
        containerRef.current.style.setProperty('--mouse-px', `${px * 16}px`);
        containerRef.current.style.setProperty('--mouse-py', `${py * 16}px`);
        containerRef.current.style.setProperty('--mouse-rot-y', `${px * 8}deg`);
        containerRef.current.style.setProperty('--mouse-rot-x', `${-py * 8}deg`);
      }

      ctx.clearRect(0, 0, width, height);

      // Draw subtle particles
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

        const renderX = p.x + px * 12;
        const renderY = p.y + py * 12;

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
      className="fintech-3d-bg"
      aria-hidden="true"
    >
      {/* 1. Deep Atmospheric Gradient Base */}
      <div className="bg-gradient-base" />

      {/* 2. Soft Ambient Blurred Light Orbs */}
      <div className="ambient-light-orb orb-cyan-top" />
      <div className="ambient-light-orb orb-violet-mid" />
      <div className="ambient-light-orb orb-blue-bottom" />
      <div className="ambient-light-orb orb-cyan-center" />

      {/* 3. Floating 3D Glass Objects Layer */}
      <div className="floating-3d-layer">
        {/* Sphere 1: Large translucent glass sphere top right */}
        <div className="glass-sphere sphere-lg sphere-pos-1">
          <div className="sphere-specular" />
          <div className="sphere-glow" />
        </div>

        {/* Sphere 2: Mid-size glass sphere left side */}
        <div className="glass-sphere sphere-md sphere-pos-2">
          <div className="sphere-specular" />
        </div>

        {/* Sphere 3: Small glass sphere bottom center */}
        <div className="glass-sphere sphere-sm sphere-pos-3">
          <div className="sphere-specular" />
        </div>

        {/* Sphere 4: Micro accent sphere near top left */}
        <div className="glass-sphere sphere-xs sphere-pos-4">
          <div className="sphere-specular" />
        </div>

        {/* 3D Glass Ring 1: Abstract rotating torus top-right */}
        <div className="glass-ring ring-1">
          <div className="ring-inner" />
        </div>

        {/* 3D Glass Ring 2: Abstract tilted geometric ring lower-left */}
        <div className="glass-ring ring-2">
          <div className="ring-inner" />
        </div>

        {/* 3D Hexagonal Glass Prism element */}
        <div className="glass-prism prism-1" />
      </div>

      {/* 4. Canvas for sparse drifting micro-particles */}
      <canvas ref={canvasRef} className="particles-canvas" />

      {/* 5. Subtle Vignette & Depth Mask */}
      <div className="bg-depth-vignette" />
    </div>
  );
}
