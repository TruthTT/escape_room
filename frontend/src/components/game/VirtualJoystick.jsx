import { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";

const VirtualJoystick = ({ onMove, onStop }) => {
  const joystickRef = useRef(null);
  const knobRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const maxDistance = 40;

  const handleStart = useCallback((clientX, clientY) => {
    setIsDragging(true);
  }, []);

  const handleMove = useCallback((clientX, clientY) => {
    if (!isDragging || !joystickRef.current) return;

    const rect = joystickRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    let dx = clientX - centerX;
    let dy = clientY - centerY;

    // Calculate distance and angle
    const distance = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);

    // Clamp to max distance
    const clampedDistance = Math.min(distance, maxDistance);
    dx = Math.cos(angle) * clampedDistance;
    dy = Math.sin(angle) * clampedDistance;

    setPosition({ x: dx, y: dy });

    // Normalize direction for movement
    if (distance > 5) {
      const normalizedX = dx / maxDistance;
      const normalizedY = dy / maxDistance;
      onMove(normalizedX, normalizedY);
    }
  }, [isDragging, maxDistance, onMove]);

  const handleEnd = useCallback(() => {
    setIsDragging(false);
    setPosition({ x: 0, y: 0 });
    onStop();
  }, [onStop]);

  useEffect(() => {
    const handleTouchMove = (e) => {
      if (isDragging && e.touches.length > 0) {
        e.preventDefault();
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const handleTouchEnd = () => {
      handleEnd();
    };

    const handleMouseMove = (e) => {
      handleMove(e.clientX, e.clientY);
    };

    const handleMouseUp = () => {
      handleEnd();
    };

    if (isDragging) {
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleTouchEnd);
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMove, handleEnd]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed bottom-24 left-6 z-30 touch-none select-none md:hidden"
      data-testid="virtual-joystick"
    >
      {/* Joystick base */}
      <div
        ref={joystickRef}
        className="w-28 h-28 rounded-full bg-black/30 backdrop-blur-sm border-2 border-white/20 flex items-center justify-center"
        onTouchStart={(e) => {
          e.preventDefault();
          handleStart(e.touches[0].clientX, e.touches[0].clientY);
        }}
        onMouseDown={(e) => {
          handleStart(e.clientX, e.clientY);
        }}
      >
        {/* Direction indicators */}
        <div className="absolute inset-4 rounded-full border border-white/10" />
        
        {/* Joystick knob */}
        <div
          ref={knobRef}
          className="w-12 h-12 rounded-full bg-[#D4AF37]/80 border-2 border-[#D4AF37] shadow-lg transition-transform duration-75"
          style={{
            transform: `translate(${position.x}px, ${position.y}px)`,
          }}
        />
      </div>
      
      {/* Label */}
      <p className="text-center text-white/40 text-xs mt-2 uppercase tracking-wider">
        Move
      </p>
    </motion.div>
  );
};

export default VirtualJoystick;
