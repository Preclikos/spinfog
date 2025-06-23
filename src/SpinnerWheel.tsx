import React, { useEffect, useRef, useState } from 'react';

interface SpinnerWheelProps {
  items: string[];
  remove: (name: string) => void;
}

const SpinnerWheel = ({ items, remove }: SpinnerWheelProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [angle, setAngle] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [winnerIndex, setWinnerIndex] = useState<number | null>(null);
  const [glowIntensity, setGlowIntensity] = useState(0);
  const [wheelSize, setWheelSize] = useState(500);

  // Calculate optimal wheel size based on available space
  useEffect(() => {
    const calculateSize = () => {
      if (containerRef.current) {
        const container = containerRef.current;
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        
        // Account for padding and button space (roughly 200px for buttons and text)
        const availableHeight = containerHeight - 200;
        const availableWidth = containerWidth - 100; // Account for horizontal padding
        
        // Use 85% of the available space, with min 400px and max 600px
        const optimalSize = Math.max(400, Math.min(availableWidth, availableHeight) * 0.85);
        
        setWheelSize(optimalSize);
      }
    };

    calculateSize();
    window.addEventListener('resize', calculateSize);
    
    return () => window.removeEventListener('resize', calculateSize);
  }, []);

  const radius = wheelSize / 2;

  // Beautiful color palette for the wheel segments
  const colors = [
    '#FF6B6B', // Coral Red
    '#4ECDC4', // Turquoise
    '#45B7D1', // Sky Blue
    '#96CEB4', // Mint Green
    '#FFEAA7', // Light Yellow
    '#DDA0DD', // Plum
    '#98D8C8', // Mint
    '#F7DC6F', // Light Gold
    '#BB8FCE', // Light Purple
    '#85C1E9', // Light Blue
    '#F8C471', // Peach
    '#82E0AA', // Light Green
    '#F1948A', // Light Red
    '#AED6F1', // Powder Blue
    '#D7BDE2', // Lavender
    '#A9DFBF', // Pale Green
  ];

  // Draw wheel + glow animation for winner
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, wheelSize, wheelSize);
    
    if (items.length === 0) {
      // Draw empty wheel
      ctx.fillStyle = '#374151';
      ctx.beginPath();
      ctx.arc(radius, radius, radius - 10, 0, 2 * Math.PI);
      ctx.fill();
      
      ctx.fillStyle = '#9CA3AF';
      ctx.font = 'bold 18px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('No users yet', radius, radius);
      return;
    }

    const segmentAngle = (2 * Math.PI) / items.length;

    items.forEach((item, i) => {
      const start = angle + i * segmentAngle;
      const end = start + segmentAngle;

      // Highlight winner with glow
      if (i === winnerIndex) {
        ctx.shadowColor = `rgba(255, 215, 0, ${glowIntensity})`;
        ctx.shadowBlur = 30 * glowIntensity;
      } else {
        ctx.shadowBlur = 0;
      }

      // Use colorful palette
      ctx.fillStyle = colors[i % colors.length];
      ctx.beginPath();
      ctx.moveTo(radius, radius);
      ctx.arc(radius, radius, radius - 10, start, end);
      ctx.closePath();
      ctx.fill();

      // Add border between segments
      ctx.strokeStyle = '#1F2937';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Text on segments
      ctx.save();
      ctx.translate(radius, radius);
      ctx.rotate(start + segmentAngle / 2);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 16px Arial';
      ctx.textAlign = 'right';
      ctx.shadowBlur = 2;
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      
      // Truncate long names
      const displayName = item.length > 15 ? item.substring(0, 15) + '...' : item;
      ctx.fillText(displayName, radius - 25, 6);
      ctx.restore();
    });

    // Draw center circle
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#1F2937';
    ctx.beginPath();
    ctx.arc(radius, radius, 20, 0, 2 * Math.PI);
    ctx.fill();

    // Draw arrow pointer at top
    ctx.fillStyle = '#FBBF24';
    ctx.strokeStyle = '#1F2937';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(radius - 15, 20);
    ctx.lineTo(radius + 15, 20);
    ctx.lineTo(radius, 45);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }, [angle, items, winnerIndex, glowIntensity]);

  // Glow pulse animation for winner segment
  useEffect(() => {
    if (winnerIndex === null) return;

    let animationFrame: number;
    let direction = 1;

    const pulse = () => {
      setGlowIntensity((v) => {
        let next = v + direction * 0.03;
        if (next >= 1) direction = -1;
        if (next <= 0.3) direction = 1;
        return Math.min(Math.max(next, 0.3), 1);
      });
      animationFrame = requestAnimationFrame(pulse);
    };

    pulse();

    return () => cancelAnimationFrame(animationFrame);
  }, [winnerIndex]);

  const handleSpin = () => {
    if (items.length === 0 || spinning) return;

    setSpinning(true);
    setWinnerIndex(null);

    const totalSpins = Math.random() * 3 + 6; // 6-9 spins
    const targetAngle = Math.random() * 2 * Math.PI;
    const duration = 4500;
    const startTime = performance.now();

    const animate = (time: number) => {
      const elapsed = time - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 4);

      const currentAngle = easeOut * totalSpins * 2 * Math.PI + targetAngle;
      setAngle(currentAngle % (2 * Math.PI));

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        const index =
          Math.floor(
            ((2 * Math.PI - (currentAngle % (2 * Math.PI))) / (2 * Math.PI)) *
              items.length
          ) % items.length;
        setWinnerIndex(index);
        setSpinning(false);
      }
    };

    requestAnimationFrame(animate);
  };

  const closeWinnerModal = () => {
    setWinnerIndex(null);
    setGlowIntensity(0);
  };

  const removeWinner = () => {
    if (winnerIndex !== null) {
      remove(items[winnerIndex]);
    }
    closeWinnerModal();
  };

  return (
    <>
      <div ref={containerRef} className="w-full h-full flex flex-col items-center justify-center">
        <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-gray-700/50 flex flex-col items-center">
          <h2 className="text-3xl font-bold text-purple-400 mb-6 text-center flex items-center justify-center gap-3">
            <span className="text-3xl">🎡</span>
            <span>Spinner Wheel</span>
          </h2>
          
          <div className="flex justify-center mb-6">
            <canvas
              ref={canvasRef}
              width={wheelSize}
              height={wheelSize}
              className="rounded-full shadow-2xl border-4 border-gray-600"
            />
          </div>

          <button
            onClick={handleSpin}
            disabled={spinning || items.length === 0}
            className={`w-full max-w-md py-5 px-8 font-bold text-xl rounded-xl transition-all duration-200 ${
              spinning || items.length === 0
                ? 'bg-gray-600 cursor-not-allowed text-gray-400'
                : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
            }`}
          >
            {spinning ? (
              <div className="flex items-center justify-center gap-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                <span>Spinning...</span>
              </div>
            ) : items.length === 0 ? (
              'No users to spin'
            ) : (
              '🎯 SPIN THE WHEEL!'
            )}
          </button>
        </div>
      </div>

      {/* Winner Modal */}
      {winnerIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={closeWinnerModal}
          />
          
          {/* Modal */}
          <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl border border-gray-600 animate-in slide-in-from-bottom-4 zoom-in-95 duration-300">
            <div className="text-center">
              <div className="text-6xl mb-4 animate-bounce">🎉</div>
              <h3 className="text-3xl font-bold text-yellow-400 mb-2 animate-pulse">
                WINNER!
              </h3>
              <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 rounded-lg p-4 mb-6 shadow-lg">
                <p className="text-2xl font-bold break-words">
                  {items[winnerIndex]}
                </p>
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={removeWinner}
                  className="flex-1 bg-red-600 hover:bg-red-700 px-6 py-3 rounded-lg font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2 hover:scale-105"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  Remove Winner
                </button>
                <button
                  onClick={closeWinnerModal}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 px-6 py-3 rounded-lg font-semibold text-white transition-all duration-200 hover:scale-105"
                >
                  Keep & Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SpinnerWheel;
