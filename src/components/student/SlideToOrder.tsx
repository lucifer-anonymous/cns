import { useState, useRef } from 'react';
import { ChevronRight } from 'lucide-react';

interface SlideToOrderProps {
  amount: number;
  onConfirm: () => void;
  disabled?: boolean;
}

export function SlideToOrder({ amount, onConfirm, disabled }: SlideToOrderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);

  const handleStart = (clientX: number) => {
    if (disabled) return;
    setIsDragging(true);
  };

  const handleMove = (clientX: number) => {
    if (!isDragging || !trackRef.current || disabled) return;

    const rect = trackRef.current.getBoundingClientRect();
    const maxX = rect.width - 56;
    const x = Math.max(0, Math.min(clientX - rect.left - 28, maxX));
    const newProgress = x / maxX;
    setProgress(newProgress);
  };

  const handleEnd = () => {
    if (progress > 0.85) {
      onConfirm();
    }
    setProgress(0);
    setIsDragging(false);
  };

  return (
    <div
      ref={trackRef}
      className={`relative h-14 rounded-full slide-action overflow-hidden select-none ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-grab active:cursor-grabbing'
      }`}
      onMouseDown={(e) => handleStart(e.clientX)}
      onMouseMove={(e) => handleMove(e.clientX)}
      onMouseUp={handleEnd}
      onMouseLeave={handleEnd}
      onTouchStart={(e) => handleStart(e.touches[0].clientX)}
      onTouchMove={(e) => handleMove(e.touches[0].clientX)}
      onTouchEnd={handleEnd}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-primary-foreground font-semibold text-sm">
          Slide to Pay | ₹{amount.toFixed(2)}
        </span>
      </div>
      <div
        className="absolute left-1 top-1 bottom-1 w-12 h-12 bg-primary-foreground rounded-full flex items-center justify-center shadow-lg transition-transform"
        style={{ transform: `translateX(${progress * (trackRef.current?.offsetWidth ? trackRef.current.offsetWidth - 56 : 0)}px)` }}
      >
        <ChevronRight className="w-6 h-6 text-primary" />
      </div>
    </div>
  );
}
