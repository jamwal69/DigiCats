import { useMemo } from 'react';
import { Kitty, BODY_COLORS, EYE_COLORS, PATTERNS } from '@/lib/web3/types';

interface CatAvatarProps {
  kitty: Kitty;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showEffects?: boolean;
  evolutionStage?: number;
}

// Generate unique cat features based on tokenId
const generateUniqueFeatures = (tokenId: bigint) => {
  const id = Number(tokenId);
  
  return {
    // Face shape variations
    faceWidth: 32 + (id % 8),
    faceHeight: 28 + (id % 6),
    
    // Ear variations
    earSize: 12 + (id % 6),
    earAngle: -5 + (id % 15),
    earTipStyle: id % 3, // 0: pointed, 1: rounded, 2: folded
    
    // Eye variations
    eyeSize: 8 + (id % 4),
    eyeSpacing: 18 + (id % 6),
    eyeShape: id % 4, // 0: round, 1: almond, 2: wide, 3: sleepy
    pupilStyle: id % 3, // 0: round, 1: slit, 2: star
    
    // Nose variations
    noseSize: 3 + (id % 3),
    noseShape: id % 3, // 0: triangle, 1: heart, 2: round
    
    // Mouth variations
    mouthStyle: id % 4, // 0: smile, 1: neutral, 2: :3, 3: open
    
    // Fur patterns
    hasStripes: id % 3 === 0,
    hasSpots: id % 4 === 0,
    hasPatch: id % 5 === 0,
    stripesCount: 2 + (id % 4),
    
    // Unique markings
    hasBlaze: id % 6 === 0, // white stripe on forehead
    hasSocks: id % 5 === 0, // white paws indication
    hasTuxedo: id % 8 === 0, // white chest
    
    // Whisker variations
    whiskerLength: 12 + (id % 8),
    whiskerCurve: -3 + (id % 6),
    whiskerCount: 2 + (id % 2),
    
    // Fluff variations
    cheekFluff: id % 3, // 0: none, 1: small, 2: fluffy
    chinFluff: id % 2 === 0,
    
    // Expression seed
    expressionSeed: id % 10,
  };
};

// Darken a color for shading
const darkenColor = (hex: string, amount: number): string => {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, (num >> 16) - amount);
  const g = Math.max(0, ((num >> 8) & 0x00FF) - amount);
  const b = Math.max(0, (num & 0x0000FF) - amount);
  return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
};

// Lighten a color for highlights
const lightenColor = (hex: string, amount: number): string => {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, (num >> 16) + amount);
  const g = Math.min(255, ((num >> 8) & 0x00FF) + amount);
  const b = Math.min(255, (num & 0x0000FF) + amount);
  return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
};

export const CatAvatar = ({ kitty, size = 'md', showEffects = false, evolutionStage = 0 }: CatAvatarProps) => {
  const bodyColor = BODY_COLORS[kitty.bodyColor];
  const eyeColor = EYE_COLORS[kitty.eyeColor];
  const shadowColor = darkenColor(bodyColor, 40);
  const highlightColor = lightenColor(bodyColor, 30);
  
  const features = useMemo(() => generateUniqueFeatures(kitty.tokenId), [kitty.tokenId]);
  
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
    xl: 'w-40 h-40',
  };

  // Get eye path based on shape
  const getEyeShape = (cx: number, cy: number, isLeft: boolean) => {
    const rx = features.eyeSize;
    const ry = features.eyeSize + 2;
    
    switch (features.eyeShape) {
      case 1: // Almond
        return `M ${cx - rx} ${cy} Q ${cx} ${cy - ry * 1.2} ${cx + rx} ${cy} Q ${cx} ${cy + ry * 0.8} ${cx - rx} ${cy}`;
      case 2: // Wide
        return `M ${cx - rx * 1.2} ${cy} Q ${cx} ${cy - ry} ${cx + rx * 1.2} ${cy} Q ${cx} ${cy + ry} ${cx - rx * 1.2} ${cy}`;
      case 3: // Sleepy
        return `M ${cx - rx} ${cy + 2} Q ${cx} ${cy - ry * 0.6} ${cx + rx} ${cy + 2} Q ${cx} ${cy + ry * 0.8} ${cx - rx} ${cy + 2}`;
      default: // Round
        return null;
    }
  };

  // Get pupil based on style
  const renderPupil = (cx: number, cy: number) => {
    const pupilSize = features.eyeSize * 0.6;
    
    switch (features.pupilStyle) {
      case 1: // Slit
        return (
          <ellipse 
            cx={cx} 
            cy={cy + 2} 
            rx={pupilSize * 0.3} 
            ry={pupilSize * 1.2} 
            fill="#111"
          />
        );
      case 2: // Star
        return (
          <g transform={`translate(${cx}, ${cy + 2})`}>
            <circle r={pupilSize * 0.8} fill="#111" />
            <circle r={pupilSize * 0.3} fill={lightenColor(eyeColor, 60)} />
          </g>
        );
      default: // Round
        return <circle cx={cx} cy={cy + 2} r={pupilSize} fill="#111" />;
    }
  };

  // Get mouth path based on style
  const getMouthPath = () => {
    const baseY = 66;
    switch (features.mouthStyle) {
      case 1: // Neutral
        return `M 45 ${baseY} L 55 ${baseY}`;
      case 2: // :3 cat mouth
        return `M 42 ${baseY} Q 47 ${baseY + 4} 50 ${baseY} Q 53 ${baseY + 4} 58 ${baseY}`;
      case 3: // Open/meow
        return `M 44 ${baseY} Q 50 ${baseY + 8} 56 ${baseY}`;
      default: // Smile
        return `M 44 ${baseY} Q 50 ${baseY + 5} 56 ${baseY}`;
    }
  };

  // Generate fur pattern
  const renderFurPattern = () => {
    const patterns = [];
    
    if (features.hasStripes) {
      for (let i = 0; i < features.stripesCount; i++) {
        const y = 40 + i * 8;
        patterns.push(
          <path
            key={`stripe-${i}`}
            d={`M ${35 + i * 3} ${y} Q 50 ${y - 3} ${65 - i * 3} ${y}`}
            stroke={shadowColor}
            strokeWidth="2"
            fill="none"
            opacity="0.4"
          />
        );
      }
    }
    
    if (features.hasSpots) {
      const spots = [
        { cx: 35, cy: 48, r: 3 },
        { cx: 65, cy: 52, r: 2.5 },
        { cx: 42, cy: 62, r: 2 },
      ];
      spots.forEach((spot, i) => {
        patterns.push(
          <circle
            key={`spot-${i}`}
            cx={spot.cx}
            cy={spot.cy}
            r={spot.r}
            fill={shadowColor}
            opacity="0.5"
          />
        );
      });
    }
    
    if (features.hasBlaze) {
      patterns.push(
        <path
          key="blaze"
          d="M 48 30 L 50 25 L 52 30 L 50 45 Z"
          fill="#FFFFFF"
          opacity="0.9"
        />
      );
    }
    
    if (features.hasTuxedo) {
      patterns.push(
        <ellipse
          key="tuxedo"
          cx="50"
          cy="72"
          rx="15"
          ry="12"
          fill="#FFFFFF"
          opacity="0.9"
        />
      );
    }
    
    return patterns;
  };

  // Render cheek fluff
  const renderCheekFluff = () => {
    if (features.cheekFluff === 0) return null;
    
    const fluffSize = features.cheekFluff === 2 ? 8 : 5;
    return (
      <>
        <ellipse cx={28} cy={58} rx={fluffSize} ry={fluffSize - 2} fill={highlightColor} />
        <ellipse cx={72} cy={58} rx={fluffSize} ry={fluffSize - 2} fill={highlightColor} />
      </>
    );
  };

  // Evolution effects
  const renderEvolutionEffects = () => {
    if (!showEffects || evolutionStage === 0) return null;
    
    const effects = [];
    
    if (evolutionStage >= 1) {
      // Subtle glow
      effects.push(
        <ellipse
          key="glow"
          cx="50"
          cy="55"
          rx="40"
          ry="35"
          fill={`url(#evolutionGlow-${kitty.tokenId})`}
          opacity="0.3"
        />
      );
    }
    
    if (evolutionStage >= 3) {
      // Sparkles for elder cats
      effects.push(
        <g key="sparkles" className="animate-pulse">
          <text x="20" y="25" fontSize="8">✨</text>
          <text x="75" y="30" fontSize="6">✨</text>
          <text x="15" y="70" fontSize="5">✨</text>
        </g>
      );
    }
    
    if (evolutionStage >= 4) {
      // Legendary aura
      effects.push(
        <ellipse
          key="aura"
          cx="50"
          cy="55"
          rx="45"
          ry="40"
          fill="none"
          stroke="url(#legendaryAura)"
          strokeWidth="2"
          opacity="0.6"
          className="animate-pulse"
        />
      );
    }
    
    return effects;
  };

  const leftEyeX = 50 - features.eyeSpacing / 2;
  const rightEyeX = 50 + features.eyeSpacing / 2;

  return (
    <svg viewBox="0 0 100 100" className={sizeClasses[size]}>
      <defs>
        {/* Fur gradient */}
        <radialGradient id={`furGradient-${kitty.tokenId}`} cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor={highlightColor} />
          <stop offset="100%" stopColor={bodyColor} />
        </radialGradient>
        
        {/* Eye shine gradient */}
        <radialGradient id={`eyeShine-${kitty.tokenId}`} cx="30%" cy="30%" r="50%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor={lightenColor(eyeColor, 20)} />
        </radialGradient>
        
        {/* Evolution glow */}
        <radialGradient id={`evolutionGlow-${kitty.tokenId}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={eyeColor} stopOpacity="0.4" />
          <stop offset="100%" stopColor={eyeColor} stopOpacity="0" />
        </radialGradient>
        
        {/* Legendary aura gradient */}
        <linearGradient id="legendaryAura" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFD700" />
          <stop offset="50%" stopColor="#FF69B4" />
          <stop offset="100%" stopColor="#00CED1" />
        </linearGradient>

        {/* Inner ear gradient */}
        <linearGradient id={`innerEar-${kitty.tokenId}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFB6C1" />
          <stop offset="100%" stopColor="#FF69B4" />
        </linearGradient>
      </defs>

      {/* Evolution effects (behind cat) */}
      {renderEvolutionEffects()}
      
      {/* Left Ear */}
      <g transform={`rotate(${-features.earAngle}, 30, 35)`}>
        <polygon
          points={`${20 - features.earSize / 3},38 30,${15 - features.earSize / 2} ${40 + features.earSize / 3},38`}
          fill={`url(#furGradient-${kitty.tokenId})`}
        />
        <polygon
          points="24,35 30,20 36,35"
          fill={`url(#innerEar-${kitty.tokenId})`}
        />
        {features.earTipStyle === 2 && (
          <path d="M 28 18 Q 30 22 32 18" stroke={shadowColor} strokeWidth="3" fill="none" />
        )}
      </g>
      
      {/* Right Ear */}
      <g transform={`rotate(${features.earAngle}, 70, 35)`}>
        <polygon
          points={`${60 - features.earSize / 3},38 70,${15 - features.earSize / 2} ${80 + features.earSize / 3},38`}
          fill={`url(#furGradient-${kitty.tokenId})`}
        />
        <polygon
          points="64,35 70,20 76,35"
          fill={`url(#innerEar-${kitty.tokenId})`}
        />
        {features.earTipStyle === 2 && (
          <path d="M 68 18 Q 70 22 72 18" stroke={shadowColor} strokeWidth="3" fill="none" />
        )}
      </g>
      
      {/* Head/Face */}
      <ellipse
        cx="50"
        cy="55"
        rx={features.faceWidth}
        ry={features.faceHeight}
        fill={`url(#furGradient-${kitty.tokenId})`}
      />
      
      {/* Face shadow for depth */}
      <ellipse
        cx="50"
        cy="60"
        rx={features.faceWidth - 5}
        ry={features.faceHeight - 8}
        fill={shadowColor}
        opacity="0.15"
      />
      
      {/* Fur patterns */}
      {renderFurPattern()}
      
      {/* Cheek fluff */}
      {renderCheekFluff()}
      
      {/* Chin fluff */}
      {features.chinFluff && (
        <ellipse cx="50" cy="78" rx="8" ry="5" fill={highlightColor} />
      )}
      
      {/* Left Eye */}
      {features.eyeShape === 0 ? (
        <ellipse
          cx={leftEyeX}
          cy="50"
          rx={features.eyeSize}
          ry={features.eyeSize + 2}
          fill={`url(#eyeShine-${kitty.tokenId})`}
        />
      ) : (
        <path
          d={getEyeShape(leftEyeX, 50, true)!}
          fill={`url(#eyeShine-${kitty.tokenId})`}
        />
      )}
      <ellipse cx={leftEyeX} cy="52" rx={features.eyeSize - 2} ry={features.eyeSize} fill={eyeColor} />
      {renderPupil(leftEyeX, 50)}
      <ellipse cx={leftEyeX + 2} cy="48" rx="2" ry="2.5" fill="white" opacity="0.9" />
      
      {/* Right Eye */}
      {features.eyeShape === 0 ? (
        <ellipse
          cx={rightEyeX}
          cy="50"
          rx={features.eyeSize}
          ry={features.eyeSize + 2}
          fill={`url(#eyeShine-${kitty.tokenId})`}
        />
      ) : (
        <path
          d={getEyeShape(rightEyeX, 50, false)!}
          fill={`url(#eyeShine-${kitty.tokenId})`}
        />
      )}
      <ellipse cx={rightEyeX} cy="52" rx={features.eyeSize - 2} ry={features.eyeSize} fill={eyeColor} />
      {renderPupil(rightEyeX, 50)}
      <ellipse cx={rightEyeX + 2} cy="48" rx="2" ry="2.5" fill="white" opacity="0.9" />
      
      {/* Nose */}
      {features.noseShape === 0 ? (
        <polygon
          points={`${50 - features.noseSize} 62, 50 ${58 - features.noseSize}, ${50 + features.noseSize} 62`}
          fill="#FF69B4"
        />
      ) : features.noseShape === 1 ? (
        <path
          d={`M ${50 - features.noseSize} 62 Q 50 ${58 - features.noseSize} ${50 + features.noseSize} 62 Q 50 ${64 + features.noseSize} ${50 - features.noseSize} 62`}
          fill="#FF69B4"
        />
      ) : (
        <ellipse cx="50" cy="61" rx={features.noseSize} ry={features.noseSize - 1} fill="#FF69B4" />
      )}
      <ellipse cx="49" cy="60" rx="1" ry="0.8" fill="#FFB6C1" opacity="0.6" />
      
      {/* Nose to mouth line */}
      <line x1="50" y1="62" x2="50" y2="66" stroke="#333" strokeWidth="0.8" />
      
      {/* Mouth */}
      <path
        d={getMouthPath()}
        stroke="#333"
        strokeWidth="1.5"
        fill={features.mouthStyle === 3 ? '#FF69B4' : 'none'}
        strokeLinecap="round"
      />
      
      {/* Whiskers */}
      {Array.from({ length: features.whiskerCount }).map((_, i) => (
        <g key={`whiskers-${i}`}>
          <line
            x1={18 - i * 2}
            y1={58 + i * 4 + features.whiskerCurve}
            x2={35}
            y2={60 + i * 3}
            stroke="#333"
            strokeWidth="0.7"
            opacity="0.7"
          />
          <line
            x1={65}
            y1={60 + i * 3}
            x2={82 + i * 2}
            y2={58 + i * 4 + features.whiskerCurve}
            stroke="#333"
            strokeWidth="0.7"
            opacity="0.7"
          />
        </g>
      ))}
      
      {/* Accessories */}
      {kitty.accessory === 1 && (
        <g>
          <circle cx="25" cy="30" r="6" fill="#FF69B4" />
          <circle cx="25" cy="30" r="3" fill="#FFB6C1" />
        </g>
      )}
      {kitty.accessory === 2 && (
        <g>
          <polygon points="35,15 50,2 65,15" fill="#FFD700" stroke="#DAA520" strokeWidth="1" />
          <polygon points="40,15 50,5 60,15" fill="#FFF8DC" opacity="0.5" />
          <circle cx="50" cy="10" r="2" fill="#FF0000" />
        </g>
      )}
      {kitty.accessory === 3 && (
        <g>
          <ellipse cx={leftEyeX} cy="50" rx={features.eyeSize + 3} ry={features.eyeSize + 4} fill="none" stroke="#333" strokeWidth="1.5" />
          <ellipse cx={rightEyeX} cy="50" rx={features.eyeSize + 3} ry={features.eyeSize + 4} fill="none" stroke="#333" strokeWidth="1.5" />
          <line x1={leftEyeX + features.eyeSize + 3} y1="50" x2={rightEyeX - features.eyeSize - 3} y2="50" stroke="#333" strokeWidth="1.5" />
          <line x1="15" y1="48" x2={leftEyeX - features.eyeSize - 3} y2="50" stroke="#333" strokeWidth="1.5" />
          <line x1={rightEyeX + features.eyeSize + 3} y1="50" x2="85" y2="48" stroke="#333" strokeWidth="1.5" />
        </g>
      )}
      
      {/* Special star */}
      {kitty.isSpecial && (
        <text x="78" y="22" fontSize="12" className="animate-pulse">⭐</text>
      )}
    </svg>
  );
};
