import React, { useEffect, useState } from 'react';

const CursorGlow = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    // Check if device supports hover (typically laptops/desktops with mice)
    const mediaQuery = window.matchMedia('(hover: hover) and (pointer: fine)');
    setIsMobile(!mediaQuery.matches);

    const handleMediaQueryChange = (e) => {
      setIsMobile(!e.matches);
    };

    mediaQuery.addEventListener('change', handleMediaQueryChange);

    return () => {
      mediaQuery.removeEventListener('change', handleMediaQueryChange);
    };
  }, []);

  useEffect(() => {
    if (isMobile) return;

    const handleMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isMobile, isVisible]);

  if (isMobile || !isVisible) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-40 overflow-hidden"
      style={{ mixBlendMode: 'plus-lighter' }}
    >
      <div
        className="absolute w-[400px] h-[400px] rounded-full opacity-60 dark:opacity-40 transition-opacity duration-500 blur-[80px]"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle, rgba(239, 99, 81, 0.15) 0%, rgba(243, 131, 117, 0.05) 50%, transparent 70%)',
        }}
      />
    </div>
  );
};

export default CursorGlow;
