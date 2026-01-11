
import React, { useEffect, useRef } from 'react';

const Visualizer: React.FC<{ isPlaying: boolean }> = ({ isPlaying }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    const bars = 32;
    const barWidth = canvas.width / bars;
    const heights = new Array(bars).fill(0).map(() => Math.random() * 40);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#10b981'; // emerald-500

      for (let i = 0; i < bars; i++) {
        const target = isPlaying ? Math.random() * 40 + 5 : 2;
        heights[i] += (target - heights[i]) * 0.1;
        const x = i * barWidth;
        const h = heights[i];
        ctx.fillRect(x + 2, canvas.height - h, barWidth - 4, h);
      }
      animationId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationId);
  }, [isPlaying]);

  return <canvas ref={canvasRef} width={300} height={50} className="w-full h-12 opacity-50" />;
};

export default Visualizer;
