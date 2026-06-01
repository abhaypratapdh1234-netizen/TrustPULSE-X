import { useApp } from '../context/AppContext';

export default function BrandLogo({ size = 'md', showText = true, showTagline = false, className = '' }) {
  const { theme } = useApp();

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

  const pulseGradient = theme === 'cream-green' 
    ? 'from-emerald-600 to-green-700' 
    : theme === 'light' 
      ? 'from-blue-600 to-indigo-600' 
      : 'from-blue-400 to-purple-500';

  const xColor = theme === 'cream-green' 
    ? 'text-emerald-700' 
    : theme === 'light' 
      ? 'text-rose-600' 
      : 'text-rose-500';

  const logoIcon = (
    <div 
      className={`${iconSizes[size]} flex items-center justify-center border border-theme overflow-hidden p-1.5`}
      style={{ background: 'var(--bg-secondary)' }}
    >
      <img 
        src="/logo.png" 
        alt="TrustPULSE X Logo"
        className="w-full h-full object-contain theme-logo-img"
      />
    </div>
  );

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      <div className="relative flex-shrink-0">
        {logoIcon}
      </div>

      {showText && (
        <div className="flex flex-col justify-center leading-none select-none">
          <div className="flex items-baseline" style={{ fontFamily: "'Outfit', sans-serif" }}>
            {/* Elegant trust name in Outfit font */}
            <span className={`${textSizes[size]} font-extrabold text-primary-color tracking-tight`}>
              Trust
            </span>
            {/* Elegant pulse name in Outfit font */}
            <span className={`${textSizes[size]} font-black bg-gradient-to-r ${pulseGradient} bg-clip-text text-transparent`}>
              PULSE
            </span>
            {/* Elegant flat X without breathing animation */}
            <span className={`ml-1 text-xs font-black italic ${xColor}`}>
              X
            </span>
          </div>
          
          {showTagline && (
            <span 
              className="text-[7.5px] font-semibold uppercase tracking-[0.32em] text-secondary-color mt-1.5"
              style={{ 
                fontFamily: "'JetBrains Mono', monospace",
              }}
            >
              AI Reputation Intelligence
            </span>
          )}
        </div>
      )}
    </div>
  );
}
