
import React, { useEffect, useRef } from 'react';

const Visualizer: React.FC<{ isPlaying: boolean }> = ({ isPlaying }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    const bars = 40;
    const barWidth = canvas.width / bars;
    const heights = new Array(bars).fill(0).map(() => Math.random() * 40);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Dégradé du vert vers l'or
      const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
      gradient.addColorStop(0, '#10b981'); // Emerald
      gradient.addColorStop(1, '#d4af37'); // Gold

      ctx.fillStyle = gradient;

      for (let i = 0; i < bars; i++) {
        const target = isPlaying ? Math.random() * 40 + 5 : 2;
        heights[i] += (target - heights[i]) * 0.15;
        const x = i * barWidth;
        const h = heights[i];
        
        // Arrondir les barres pour un look plus moderne
        const radius = 2;
        ctx.beginPath();
        ctx.roundRect(x + 2, canvas.height - h, barWidth - 4, h, [radius, radius, 0, 0]);
        ctx.fill();
      }
      animationId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationId);
  }, [isPlaying]);

  return <canvas ref={canvasRef} width={400} height={60} className="w-full h-12 opacity-80" />;
};

export default Visualizer;
