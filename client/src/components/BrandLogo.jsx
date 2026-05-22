import { useState, useRef } from 'react';
import { motion } from 'framer-motion';

export default function BrandLogo({ size = 'md', showText = true, showTagline = false, className = '' }) {
  // Size-based classes
  const iconSizes = {
    sm: 'w-8 h-8 rounded-lg',
    md: 'w-10 h-10 rounded-xl',
    lg: 'w-14 h-14 rounded-2xl',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-3xl',
  };

  const containerClasses = `flex items-center gap-3 select-none group cursor-pointer ${className}`;

  // Interactive 3D Perspective States
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glare, setGlare] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    
    // Mouse coordinates relative to BrandLogo element
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Normalized coordinates (-0.5 to 0.5)
    const normalizedX = (x / rect.width) - 0.5;
    const normalizedY = (y / rect.height) - 0.5;
    
    // Calculate rotation limits (maximum 16 degrees tilt)
    const tiltY = normalizedX * 16;
    const tiltX = -normalizedY * 16;
    
    setRotateX(tiltX);
    setRotateY(tiltY);
    setGlare({ x: (x / rect.width) * 100, y: (y / rect.height) * 100 });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotateX(0);
    setRotateY(0);
  };

  const logoIcon = (
    <div className="relative flex-shrink-0">
      {/* Background glass shield container */}
      <motion.div
        className={`${iconSizes[size]} flex items-center justify-center relative overflow-hidden`}
        style={{
          background: 'rgba(13, 10, 25, 0.45)',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          boxShadow: 'inset 0 0 12px rgba(99, 102, 241, 0.15), 0 4px 20px rgba(0, 0, 0, 0.25)',
        }}
        whileHover={{
          borderColor: 'rgba(6, 182, 212, 0.5)',
          boxShadow: '0 0 25px rgba(99, 102, 241, 0.4), inset 0 0 8px rgba(6, 182, 212, 0.2)',
        }}
        transition={{ duration: 0.3 }}
      >
        {/* Futuristic glowing backdrop */}
        <div 
          className="absolute inset-0 opacity-20 bg-gradient-to-br from-indigo-500 via-purple-600 to-cyan-400 blur-sm group-hover:opacity-40 transition-opacity duration-300"
        />

        {/* Radar concentric circular grid */}
        <svg className="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" stroke="white" strokeWidth="1" strokeDasharray="3 3" />
          <circle cx="50" cy="50" r="25" stroke="white" strokeWidth="1" />
          <circle cx="50" cy="50" r="10" stroke="white" strokeWidth="1" />
        </svg>

        {/* Glowing Animated Heartbeat Pulse Wave */}
        <svg 
          width="100%" 
          height="100%" 
          viewBox="0 0 100 100" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10"
        >
          <defs>
            <linearGradient id="logo-pulse-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#818cf8" />
              <stop offset="50%" stopColor="#c084fc" />
              <stop offset="100%" stopColor="#22d3ee" />
            </linearGradient>
            <linearGradient id="logo-pulse-glow" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#06b6d4" />
            </linearGradient>
          </defs>

          {/* Blurred Background Glow Path */}
          <motion.path
            d="M 15 50 L 32 50 L 41 22 L 53 78 L 62 38 L 68 50 L 85 50"
            stroke="url(#logo-pulse-glow)"
            strokeWidth="9"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.35"
            style={{ filter: 'blur(3px)' }}
            initial={{ pathLength: 0, opacity: 0.1 }}
            animate={{ pathLength: 1, opacity: [0.1, 0.4, 0.1] }}
            transition={{
              pathLength: { duration: 2, ease: "easeInOut", repeat: Infinity, repeatType: "loop" },
              opacity: { duration: 2, ease: "easeInOut", repeat: Infinity }
            }}
          />

          {/* Sharp Foreground Path */}
          <motion.path
            d="M 15 50 L 32 50 L 41 22 L 53 78 L 62 38 L 68 50 L 85 50"
            stroke="url(#logo-pulse-grad)"
            strokeWidth="5.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{
              duration: 2,
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: "loop"
            }}
          />

          {/* Travelling Pulse Particle Spark */}
          <motion.circle
            r="4"
            fill="#22d3ee"
            style={{ filter: 'drop-shadow(0 0 6px #22d3ee)' }}
            initial={{ offsetDistance: "0%" }}
            animate={{ offsetDistance: "100%" }}
            transition={{
              duration: 2,
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: "loop"
            }}
          />
        </svg>
      </motion.div>

      {/* Online indicator dot (Radar style) */}
      <div 
        className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-[var(--bg-primary)] animate-pulse"
        style={{
          background: 'radial-gradient(circle, #34d399 0%, #059669 100%)',
          boxShadow: '0 0 8px #34d399, 0 0 16px rgba(52, 211, 153, 0.4)',
        }}
      />
    </div>
  );

  return (
    <div 
      ref={containerRef}
      className={containerClasses}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: 1000,
        transformStyle: 'preserve-3d',
        transform: isHovered 
          ? `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)` 
          : 'rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
        transition: isHovered ? 'none' : 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)',
      }}
    >
      {/* Icon Layer with 3D depth */}
      <div 
        className="relative flex-shrink-0"
        style={{
          transform: isHovered ? 'translateZ(25px)' : 'none',
          transition: isHovered ? 'none' : 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)',
          transformStyle: 'preserve-3d',
        }}
      >
        {logoIcon}
      </div>

      {/* Text Group Layer with higher 3D depth */}
      {showText && (
        <div 
          className="flex flex-col justify-center leading-none select-none"
          style={{
            transform: isHovered ? 'translateZ(40px)' : 'none',
            transition: isHovered ? 'none' : 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)',
            transformStyle: 'preserve-3d',
          }}
        >
          <div className="flex items-baseline" style={{ transformStyle: 'preserve-3d' }}>
            {/* Elegant trust name in Outfit font with 3D translateZ parallax */}
            <span 
              className={`${textSizes[size]} title-3d-trust transition-all duration-300`}
              style={{
                transform: isHovered ? 'translateZ(15px)' : 'none',
                transition: isHovered ? 'none' : 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)',
              }}
            >
              Trust
            </span>
            {/* Elegant pulse name in Outfit font with 3D translateZ parallax */}
            <span 
              className={`${textSizes[size]} title-3d-pulse transition-all duration-300`}
              style={{
                transform: isHovered ? 'translateZ(30px)' : 'none',
                transition: isHovered ? 'none' : 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)',
              }}
            >
              PULSE
            </span>
            {/* Glowing italicised capital X with breathing scale animation */}
            <motion.span 
              className="ml-1 text-xs title-3d-x font-black italic"
              style={{
                transform: isHovered ? 'translateZ(45px)' : 'none',
                transition: isHovered ? 'none' : 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)',
              }}
              animate={{ scale: [1, 1.25, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              X
            </motion.span>
          </div>
          
          {showTagline && (
            <span 
              className="text-[7.5px] font-semibold uppercase tracking-[0.32em] text-secondary-color mt-1.5 transition-colors group-hover:text-[#22d3ee]/90"
              style={{ 
                fontFamily: "'JetBrains Mono', monospace",
                textShadow: '0 0 4px rgba(6, 182, 212, 0.05)',
                transform: isHovered ? 'translateZ(10px)' : 'none',
                transition: isHovered ? 'none' : 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)',
              }}
            >
              AI Reputation Intelligence
            </span>
          )}
        </div>
      )}

      {/* Photorealistic light glare reflection overlay */}
      {isHovered && (
        <div 
          className="absolute inset-0 pointer-events-none rounded-xl"
          style={{
            background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255, 255, 255, 0.15) 0%, transparent 60%)`,
            mixBlendMode: 'overlay',
            zIndex: 100,
          }}
        />
      )}
    </div>
  );
}
