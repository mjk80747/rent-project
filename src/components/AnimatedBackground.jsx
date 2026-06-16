import { useEffect, useRef } from 'react';
import './AnimatedBackground.css';

function AnimatedBackground({ isDark }) {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: null, y: null, radius: 150 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];

    // Set canvas dimensions
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    // Particle class
    class Particle {
      constructor(width, height) {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.radius = Math.random() * 2 + 1; // 1px to 3px
        this.vx = (Math.random() - 0.5) * 0.4; // very slow horizontal drift
        this.vy = (Math.random() - 0.5) * 0.4; // very slow vertical drift
        this.baseOpacity = Math.random() * 0.35 + 0.15;
        this.opacity = this.baseOpacity;
      }

      update(width, height, mouse) {
        // Slowly move particle
        this.x += this.vx;
        this.y += this.vy;

        // Wrap around screen boundaries
        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;

        // Interactive behavior: React to mouse
        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const distance = Math.hypot(dx, dy);

          if (distance < mouse.radius) {
            // Repel slightly or pull slightly, repel looks cooler for a grid
            const force = (mouse.radius - distance) / mouse.radius;
            // Push particle away from mouse
            const angle = Math.atan2(dy, dx);
            this.x -= Math.cos(angle) * force * 0.8;
            this.y -= Math.sin(angle) * force * 0.8;
            
            // Brighten near mouse
            this.opacity = Math.min(this.baseOpacity + force * 0.5, 0.7);
          } else {
            // Decay opacity back to base
            if (this.opacity > this.baseOpacity) {
              this.opacity -= 0.02;
            }
          }
        } else {
          this.opacity = this.baseOpacity;
        }
      }

      draw(context, color) {
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        context.fillStyle = color.replace('opacity', this.opacity.toFixed(2));
        context.fill();
      }
    }

    // Initialize particles
    const initParticles = () => {
      particles = [];
      const particleCount = Math.min(Math.floor((canvas.width * canvas.height) / 25000), 75); // Density capped at 75 particles max
      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle(canvas.width, canvas.height));
      }
    };

    // Event listeners
    const handleMouseMove = (e) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouseRef.current.x = null;
      mouseRef.current.y = null;
    };

    // Bind event listeners
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    // Initial setup
    resizeCanvas();

    // Loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Select theme color variables
      // In dark mode, we draw faint indigo/purple particles
      // In light mode, we draw darker slate/indigo particles
      const particleColor = isDark
        ? 'rgba(129, 140, 248, opacity)' // Indigo-400
        : 'rgba(79, 70, 229, opacity)';  // Indigo-600

      const lineColor = isDark
        ? 'rgba(99, 102, 241, opacity)'
        : 'rgba(99, 102, 241, opacity)';

      const mouseColor = isDark
        ? 'rgba(16, 185, 129, opacity)' // Teal-500
        : 'rgba(16, 185, 129, opacity)';

      const width = canvas.width;
      const height = canvas.height;
      const mouse = mouseRef.current;

      // Update and draw particles
      particles.forEach((p) => {
        p.update(width, height, mouse);
        p.draw(ctx, particleColor);
      });

      // Connect particles with faint lines (network grid effect)
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];

        // Draw connections between particles
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);

          if (dist < 100) {
            const alpha = ((100 - dist) / 100) * 0.08;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = lineColor.replace('opacity', alpha.toFixed(3));
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }

        // Draw connection to mouse
        if (mouse.x !== null && mouse.y !== null) {
          const distToMouse = Math.hypot(p1.x - mouse.x, p1.y - mouse.y);
          if (distToMouse < mouse.radius) {
            const alpha = ((mouse.radius - distToMouse) / mouse.radius) * 0.15;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = mouseColor.replace('opacity', alpha.toFixed(3));
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    // Start animation
    animate();

    // Clean up
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isDark]);

  return (
    <div className="animated-bg-container">
      <div className="ambient-blob blob-indigo" />
      <div className="ambient-blob blob-teal" />
      <div className="ambient-blob blob-amber" />
      <div className="tech-grid" />
      <canvas ref={canvasRef} className="bg-canvas" />
    </div>
  );
}

export default AnimatedBackground;
