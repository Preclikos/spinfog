import React, { useEffect, useRef, useState } from 'react';

interface SpinnerWheelProps {
  items: string[];
  remove: (name: string) => void;
}

const SpinnerWheel = ({ items, remove }: SpinnerWheelProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [angle, setAngle] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [winnerIndex, setWinnerIndex] = useState<number | null>(null);
  const [glowIntensity, setGlowIntensity] = useState(0);

  const size = 320;
  const radius = size / 2;

  // Draw wheel + glow animation for winner
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, size, size);
    const segmentAngle = (2 * Math.PI) / Math.max(items.length, 1);

    items.forEach((item, i) => {
      const start = angle + i * segmentAngle;
      const end = start + segmentAngle;

      // Highlight winner with glow
      if (i === winnerIndex) {
        ctx.shadowColor = `rgba(255, 215, 0, ${glowIntensity})`; // gold glow
        ctx.shadowBlur = 20 * glowIntensity;
      } else {
        ctx.shadowBlur = 0;
      }

      // Color wheel slices in alternating tones
      ctx.fillStyle = i % 2 === 0 ? '#6b46c1' : '#805ad5'; // purple shades
      ctx.beginPath();
      ctx.moveTo(radius, radius);
      ctx.arc(radius, radius, radius, start, end);
      ctx.closePath();
      ctx.fill();

      // Text on segments
      ctx.save();
      ctx.translate(radius, radius);
      ctx.rotate(start + segmentAngle / 2);
      ctx.fillStyle = 'white';
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'right';
      ctx.fillText(item, radius - 10, 5);
      ctx.restore();
    });

    // Draw arrow at top center
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.moveTo(radius - 12, 10);
    ctx.lineTo(radius + 12, 10);
    ctx.lineTo(radius, 30);
    ctx.closePath();
    ctx.fill();
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

  const removeWinner = () => {
    if (winnerIndex) {
      remove(items[winnerIndex]);
    }
    setWinnerIndex(null);
    setGlowIntensity(0);
  };

  return (
    <>
      <div className="max-w-xl mx-auto p-6 bg-gray-900 rounded-lg text-white space-y-4 relative z-10">
        <h2 className="text-2xl font-bold text-purple-400">
          🎡 Real-Time Spinner Wheel
        </h2>
        <button
          onClick={handleSpin}
          disabled={spinning || items.length === 0}
          className={`w-full py-2 font-semibold rounded ${
            spinning
              ? 'bg-gray-600 cursor-not-allowed'
              : 'bg-purple-600 hover:bg-purple-700'
          }`}
        >
          {spinning ? 'Spinning...' : 'Spin!'}
        </button>

        <div className="flex justify-center">
          <canvas
            ref={canvasRef}
            width={size}
            height={size}
            className="rounded-full border-4 border-purple-600"
          />
        </div>
      </div>

      {winnerIndex !== null && (
        <>
          {/* Dimmed backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm z-20 flex items-center justify-center"
            onClick={removeWinner}
          ></div>

          {/* Popup modal */}
          <div className="fixed z-30 inset-0 flex items-center justify-center px-4">
            <div className="bg-gray-800 rounded-lg p-8 max-w-sm w-full text-center shadow-lg relative">
              <h3 className="text-3xl font-extrabold text-yellow-400 mb-4">
                🎉 Winner!
              </h3>
              <p className="text-xl italic text-white mb-6">
                {items[winnerIndex]}
              </p>
              <button
                onClick={removeWinner}
                className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded font-semibold text-white"
              >
                Remove Winner
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default SpinnerWheel;
