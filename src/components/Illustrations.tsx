import { useId } from "react";

export function HeroLandscape({ className = "" }: { className?: string }) {
  const id = useId();
  return (
    <svg
      viewBox="0 0 400 180"
      className={className}
      preserveAspectRatio="xMidYMid slice"
      role="img"
      aria-label="日出山景插畫"
    >
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fde2e4" />
          <stop offset="45%" stopColor="#e0c3fc" />
          <stop offset="100%" stopColor="#a1c4fd" />
        </linearGradient>
        <linearGradient id={`${id}-sun`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff6d5" />
          <stop offset="100%" stopColor="#ffd59e" />
        </linearGradient>
        <linearGradient id={`${id}-mtn-far`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#b7a4e0" />
          <stop offset="100%" stopColor="#9a86d1" />
        </linearGradient>
        <linearGradient id={`${id}-mtn-near`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8a76c9" />
          <stop offset="100%" stopColor="#6f5cb8" />
        </linearGradient>
        <linearGradient id={`${id}-water`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#cdd9f7" />
          <stop offset="100%" stopColor="#a9c1f0" />
        </linearGradient>
      </defs>

      <rect width="400" height="180" fill={`url(#${id}-sky)`} />
      <circle cx="200" cy="78" r="30" fill={`url(#${id}-sun)`} opacity="0.95" />

      <path d="M0,110 L60,70 L110,105 L170,55 L230,100 L280,68 L340,102 L400,80 L400,130 L0,130 Z" fill={`url(#${id}-mtn-far)`} opacity="0.75" />
      <path d="M0,135 L50,100 L100,128 L160,90 L210,130 L270,95 L330,132 L400,110 L400,145 L0,145 Z" fill={`url(#${id}-mtn-near)`} />

      <rect x="0" y="145" width="400" height="35" fill={`url(#${id}-water)`} />
      <path d="M0,150 Q40,146 80,150 T160,150 T240,150 T320,150 T400,150" stroke="#ffffff" strokeOpacity="0.5" strokeWidth="1.5" fill="none" />
      <path d="M0,160 Q40,156 80,160 T160,160 T240,160 T320,160 T400,160" stroke="#ffffff" strokeOpacity="0.35" strokeWidth="1.5" fill="none" />

      <g transform="translate(330,120)">
        <ellipse cx="0" cy="18" rx="20" ry="6" fill="#f7b8c4" opacity="0.5" />
        <circle cx="-8" cy="6" r="7" fill="#f5a3b5" />
        <circle cx="6" cy="2" r="8" fill="#f78fa7" />
        <circle cx="16" cy="10" r="6" fill="#f5a3b5" />
        <circle cx="-8" cy="6" r="2.5" fill="#fff3d6" />
        <circle cx="6" cy="2" r="3" fill="#fff3d6" />
      </g>
      <g transform="translate(40,128)" opacity="0.8">
        <path d="M0,15 Q-4,4 4,0 Q10,6 4,15 Z" fill="#8fbf83" />
        <path d="M6,15 Q10,6 16,4 Q18,12 10,16 Z" fill="#7bb06e" />
      </g>
    </svg>
  );
}

function IconBadge({
  gradientFrom,
  gradientTo,
  children,
}: {
  gradientFrom: string;
  gradientTo: string;
  children: React.ReactNode;
}) {
  const id = useId();
  return (
    <svg viewBox="0 0 80 80" className="w-full h-full">
      <defs>
        <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={gradientFrom} />
          <stop offset="100%" stopColor={gradientTo} />
        </linearGradient>
      </defs>
      <rect width="80" height="80" rx="20" fill={`url(#${id}-bg)`} />
      {children}
    </svg>
  );
}

export function BrainIllustration({ className = "" }: { className?: string }) {
  return (
    <div className={className}>
      <IconBadge gradientFrom="#a78bfa" gradientTo="#7c3aed">
        <g transform="translate(40,42)" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M-16,-8 C-20,-16 -12,-22 -6,-19 C-3,-23 4,-23 6,-19 C13,-22 20,-15 16,-7 C21,-3 20,7 13,9 C13,16 4,20 -2,16 C-8,20 -17,16 -17,8 C-23,5 -22,-4 -16,-8 Z" fill="rgba(255,255,255,0.12)" />
          <path d="M-6,-19 C-6,-10 -8,-2 -2,4 C2,8 2,14 -2,16" />
          <path d="M6,-19 C7,-11 9,-4 5,2" />
          <path d="M-16,-8 C-11,-6 -9,-1 -12,4" />
          <circle cx="13" cy="9" r="1.6" fill="#fff" stroke="none" />
        </g>
      </IconBadge>
    </div>
  );
}

export function TargetIllustration({ className = "" }: { className?: string }) {
  return (
    <div className={className}>
      <IconBadge gradientFrom="#6ee7b7" gradientTo="#0d9488">
        <circle cx="40" cy="42" r="19" fill="rgba(255,255,255,0.18)" stroke="#fff" strokeWidth="2.5" />
        <circle cx="40" cy="42" r="12" fill="rgba(255,255,255,0.28)" stroke="#fff" strokeWidth="2.2" />
        <circle cx="40" cy="42" r="5" fill="#fff" />
        <g stroke="#fde68a" strokeWidth="2.5" strokeLinecap="round">
          <line x1="58" y1="20" x2="42" y2="40" />
        </g>
        <path d="M58,20 L52,19 L59,26 Z" fill="#fde68a" />
      </IconBadge>
    </div>
  );
}

export function PotionIllustration({ className = "" }: { className?: string }) {
  return (
    <div className={className}>
      <IconBadge gradientFrom="#fdba74" gradientTo="#ea580c">
        <g transform="translate(40,44)">
          <path
            d="M-8,-20 L-8,-10 C-16,-2 -18,6 -18,10 C-18,20 -10,25 0,25 C10,25 18,20 18,10 C18,6 16,-2 8,-10 L8,-20 Z"
            fill="rgba(255,255,255,0.2)"
            stroke="#fff"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <rect x="-9" y="-24" width="18" height="6" rx="2" fill="#fff" />
          <path d="M0,3 C-6,-3 -14,3 -8,10 C-4,14 0,17 0,17 C0,17 4,14 8,10 C14,3 6,-3 0,3 Z" fill="#fff" />
          <circle cx="-11" cy="14" r="1.6" fill="#fff" opacity="0.8" />
          <circle cx="10" cy="17" r="1.2" fill="#fff" opacity="0.7" />
        </g>
      </IconBadge>
    </div>
  );
}

export function PinwheelIllustration({ className = "" }: { className?: string }) {
  return (
    <div className={className}>
      <IconBadge gradientFrom="#7dd3fc" gradientTo="#0284c7">
        <g transform="translate(40,38)">
          <g fill="#fff" opacity="0.95">
            <path d="M0,0 C2,-14 14,-16 16,-4 C16,2 8,4 0,0 Z" />
            <path d="M0,0 C14,-2 16,10 4,12 C-2,12 -4,4 0,0 Z" />
            <path d="M0,0 C-2,14 -14,16 -16,4 C-16,-2 -8,-4 0,0 Z" />
            <path d="M0,0 C-14,2 -16,-10 -4,-12 C2,-12 4,-4 0,0 Z" />
          </g>
          <circle cx="0" cy="0" r="3.5" fill="#fde68a" />
          <line x1="0" y1="4" x2="0" y2="26" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
        </g>
      </IconBadge>
    </div>
  );
}

export function HeartCloudIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 32" className={className}>
      <ellipse cx="24" cy="22" rx="20" ry="8" fill="#fbcfe8" opacity="0.6" />
      <ellipse cx="14" cy="16" rx="9" ry="7" fill="#fbcfe8" opacity="0.7" />
      <ellipse cx="34" cy="16" rx="9" ry="7" fill="#fbcfe8" opacity="0.7" />
      <path
        d="M24,10 C21,5 13,7 13,13 C13,19 24,26 24,26 C24,26 35,19 35,13 C35,7 27,5 24,10 Z"
        fill="#f472b6"
      />
    </svg>
  );
}

export function SproutIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 32" className={className}>
      <path d="M24,30 L24,14" stroke="#65a30d" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M24,18 C18,18 14,13 15,7 C22,7 25,12 24,18 Z" fill="#84cc16" />
      <path d="M24,22 C30,22 34,17 33,11 C26,11 23,16 24,22 Z" fill="#a3e635" />
    </svg>
  );
}

export function LeafAccent({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 24" className={className}>
      <path d="M2,20 C10,14 16,10 22,4" stroke="#84cc16" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <path d="M8,16 C11,10 15,9 17,5 C13,5 9,8 8,16 Z" fill="#a3e635" />
      <path d="M15,10 C18,6 22,6 25,2 C21,1 16,3 15,10 Z" fill="#84cc16" />
    </svg>
  );
}

export function MountainBadgeIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 18 L9 8 L13 14 L16 10 L21 18 Z" />
      <circle cx="17" cy="6" r="2" />
    </svg>
  );
}

export function CompassBadgeIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M14.5 9.5 L11 11 L9.5 14.5 L13 13 Z" fill="currentColor" stroke="none" />
    </svg>
  );
}
