"use client";

import { useState, useEffect } from "react";

const scenes = [
  {
    id: "yoga",
    label: "Yoga & Mindfulness",
    gradient: "from-emerald-900 via-teal-900 to-slate-900",
    accent: "#10b981",
    figures: [
      { pose: "tree", x: 25, y: 55, scale: 1.2, delay: 0 },
      { pose: "warrior", x: 55, y: 60, scale: 1.0, delay: 1.5 },
      { pose: "lotus", x: 75, y: 50, scale: 0.9, delay: 3 },
    ],
  },
  {
    id: "weights",
    label: "Strength Training",
    gradient: "from-slate-900 via-zinc-900 to-neutral-900",
    accent: "#f59e0b",
    figures: [
      { pose: "deadlift", x: 30, y: 55, scale: 1.3, delay: 0 },
      { pose: "bench", x: 60, y: 58, scale: 1.1, delay: 1.2 },
      { pose: "curl", x: 80, y: 52, scale: 0.9, delay: 2.5 },
    ],
  },
  {
    id: "treadmill",
    label: "Cardio & Running",
    gradient: "from-red-950 via-orange-950 to-slate-900",
    accent: "#ef4444",
    figures: [
      { pose: "sprint", x: 20, y: 50, scale: 1.1, delay: 0 },
      { pose: "run", x: 50, y: 55, scale: 1.0, delay: 0.8 },
      { pose: "jog", x: 78, y: 52, scale: 0.95, delay: 1.6 },
    ],
  },
  {
    id: "group",
    label: "Group Fitness",
    gradient: "from-indigo-950 via-purple-950 to-slate-900",
    accent: "#8b5cf6",
    figures: [
      { pose: "jump", x: 22, y: 48, scale: 1.0, delay: 0 },
      { pose: "squat", x: 42, y: 55, scale: 1.1, delay: 0.5 },
      { pose: "stretch", x: 62, y: 50, scale: 0.9, delay: 1.0 },
      { pose: "kick", x: 82, y: 52, scale: 1.0, delay: 1.5 },
    ],
  },
];

function FigureSVG({ pose, color }: { pose: string; color: string }) {
  const poses: Record<string, React.ReactNode> = {
    tree: (
      <svg viewBox="0 0 100 140" fill="none" className="w-full h-full">
        <circle cx="50" cy="18" r="10" fill={color} opacity="0.9" />
        <path d="M50 28 L50 70" stroke={color} strokeWidth="5" strokeLinecap="round" />
        <path d="M50 45 L30 70 L30 90" stroke={color} strokeWidth="5" strokeLinecap="round" fill="none" />
        <path d="M50 40 L75 55 L75 80" stroke={color} strokeWidth="5" strokeLinecap="round" fill="none" />
        <path d="M50 70 L35 110 L35 130" stroke={color} strokeWidth="5" strokeLinecap="round" fill="none" />
        <path d="M50 70 L65 110 L65 125" stroke={color} strokeWidth="5" strokeLinecap="round" fill="none" />
      </svg>
    ),
    warrior: (
      <svg viewBox="0 0 100 140" fill="none" className="w-full h-full">
        <circle cx="50" cy="15" r="10" fill={color} opacity="0.9" />
        <path d="M50 25 L50 60" stroke={color} strokeWidth="5" strokeLinecap="round" />
        <path d="M50 35 L20 45 L10 30" stroke={color} strokeWidth="5" strokeLinecap="round" fill="none" />
        <path d="M50 35 L85 40 L95 25" stroke={color} strokeWidth="5" strokeLinecap="round" fill="none" />
        <path d="M50 60 L30 95 L25 130" stroke={color} strokeWidth="5" strokeLinecap="round" fill="none" />
        <path d="M50 60 L75 90 L80 125" stroke={color} strokeWidth="5" strokeLinecap="round" fill="none" />
      </svg>
    ),
    lotus: (
      <svg viewBox="0 0 100 140" fill="none" className="w-full h-full">
        <circle cx="50" cy="20" r="10" fill={color} opacity="0.9" />
        <path d="M50 30 L50 65" stroke={color} strokeWidth="5" strokeLinecap="round" />
        <path d="M50 50 L25 55 L15 45" stroke={color} strokeWidth="5" strokeLinecap="round" fill="none" />
        <path d="M50 50 L75 55 L85 45" stroke={color} strokeWidth="5" strokeLinecap="round" fill="none" />
        <path d="M50 65 L30 85 L20 75" stroke={color} strokeWidth="5" strokeLinecap="round" fill="none" />
        <path d="M50 65 L70 85 L80 75" stroke={color} strokeWidth="5" strokeLinecap="round" fill="none" />
      </svg>
    ),
    deadlift: (
      <svg viewBox="0 0 100 140" fill="none" className="w-full h-full">
        <circle cx="50" cy="18" r="10" fill={color} opacity="0.9" />
        <path d="M50 28 L45 55 L40 75" stroke={color} strokeWidth="5" strokeLinecap="round" fill="none" />
        <path d="M40 75 L20 70" stroke={color} strokeWidth="5" strokeLinecap="round" />
        <rect x="8" y="65" width="30" height="8" rx="2" fill={color} opacity="0.8" />
        <path d="M40 75 L60 70" stroke={color} strokeWidth="5" strokeLinecap="round" />
        <rect x="58" y="65" width="30" height="8" rx="2" fill={color} opacity="0.8" />
        <path d="M50 55 L55 85 L55 130" stroke={color} strokeWidth="5" strokeLinecap="round" fill="none" />
        <path d="M50 55 L35 85 L30 125" stroke={color} strokeWidth="5" strokeLinecap="round" fill="none" />
      </svg>
    ),
    bench: (
      <svg viewBox="0 0 100 140" fill="none" className="w-full h-full">
        <circle cx="50" cy="35" r="10" fill={color} opacity="0.9" />
        <path d="M50 45 L50 60" stroke={color} strokeWidth="5" strokeLinecap="round" />
        <path d="M50 50 L20 45" stroke={color} strokeWidth="5" strokeLinecap="round" />
        <rect x="5" y="40" width="20" height="8" rx="2" fill={color} opacity="0.8" />
        <path d="M50 50 L80 45" stroke={color} strokeWidth="5" strokeLinecap="round" />
        <rect x="70" y="40" width="20" height="8" rx="2" fill={color} opacity="0.8" />
        <path d="M50 60 L40 90 L35 130" stroke={color} strokeWidth="5" strokeLinecap="round" fill="none" />
        <path d="M50 60 L60 90 L65 125" stroke={color} strokeWidth="5" strokeLinecap="round" fill="none" />
        <line x1="10" y1="100" x2="90" y2="100" stroke={color} strokeWidth="4" opacity="0.4" />
      </svg>
    ),
    curl: (
      <svg viewBox="0 0 100 140" fill="none" className="w-full h-full">
        <circle cx="50" cy="18" r="10" fill={color} opacity="0.9" />
        <path d="M50 28 L50 55" stroke={color} strokeWidth="5" strokeLinecap="round" />
        <path d="M50 40 L30 50 L25 35" stroke={color} strokeWidth="5" strokeLinecap="round" fill="none" />
        <circle cx="22" cy="30" r="8" fill={color} opacity="0.7" />
        <path d="M50 40 L70 50 L75 35" stroke={color} strokeWidth="5" strokeLinecap="round" fill="none" />
        <circle cx="78" cy="30" r="8" fill={color} opacity="0.7" />
        <path d="M50 55 L45 90 L40 130" stroke={color} strokeWidth="5" strokeLinecap="round" fill="none" />
        <path d="M50 55 L58 90 L60 125" stroke={color} strokeWidth="5" strokeLinecap="round" fill="none" />
      </svg>
    ),
    sprint: (
      <svg viewBox="0 0 100 140" fill="none" className="w-full h-full">
        <circle cx="50" cy="20" r="10" fill={color} opacity="0.9" />
        <path d="M50 30 L50 55" stroke={color} strokeWidth="5" strokeLinecap="round" />
        <path d="M50 40 L25 30 L10 15" stroke={color} strokeWidth="5" strokeLinecap="round" fill="none" />
        <path d="M50 40 L75 35 L90 25" stroke={color} strokeWidth="5" strokeLinecap="round" fill="none" />
        <path d="M50 55 L35 80 L20 110" stroke={color} strokeWidth="5" strokeLinecap="round" fill="none" />
        <path d="M50 55 L70 75 L85 100" stroke={color} strokeWidth="5" strokeLinecap="round" fill="none" />
        <ellipse cx="30" cy="120" rx="12" ry="4" fill={color} opacity="0.3" />
        <ellipse cx="75" cy="105" rx="12" ry="4" fill={color} opacity="0.3" />
      </svg>
    ),
    run: (
      <svg viewBox="0 0 100 140" fill="none" className="w-full h-full">
        <circle cx="50" cy="18" r="10" fill={color} opacity="0.9" />
        <path d="M50 28 L50 55" stroke={color} strokeWidth="5" strokeLinecap="round" />
        <path d="M50 38 L25 45 L15 55" stroke={color} strokeWidth="5" strokeLinecap="round" fill="none" />
        <path d="M50 38 L75 30 L85 20" stroke={color} strokeWidth="5" strokeLinecap="round" fill="none" />
        <path d="M50 55 L40 85 L30 120" stroke={color} strokeWidth="5" strokeLinecap="round" fill="none" />
        <path d="M50 55 L65 80 L80 110" stroke={color} strokeWidth="5" strokeLinecap="round" fill="none" />
        <ellipse cx="25" cy="125" rx="10" ry="3" fill={color} opacity="0.3" />
        <ellipse cx="80" cy="115" rx="10" ry="3" fill={color} opacity="0.3" />
      </svg>
    ),
    jog: (
      <svg viewBox="0 0 100 140" fill="none" className="w-full h-full">
        <circle cx="50" cy="20" r="10" fill={color} opacity="0.9" />
        <path d="M50 30 L50 55" stroke={color} strokeWidth="5" strokeLinecap="round" />
        <path d="M50 40 L30 48 L20 60" stroke={color} strokeWidth="5" strokeLinecap="round" fill="none" />
        <path d="M50 40 L70 42 L80 35" stroke={color} strokeWidth="5" strokeLinecap="round" fill="none" />
        <path d="M50 55 L42 85 L38 125" stroke={color} strokeWidth="5" strokeLinecap="round" fill="none" />
        <path d="M50 55 L62 82 L72 115" stroke={color} strokeWidth="5" strokeLinecap="round" fill="none" />
        <ellipse cx="35" cy="130" rx="8" ry="3" fill={color} opacity="0.3" />
        <ellipse cx="70" cy="118" rx="8" ry="3" fill={color} opacity="0.3" />
      </svg>
    ),
    jump: (
      <svg viewBox="0 0 100 140" fill="none" className="w-full h-full">
        <circle cx="50" cy="25" r="10" fill={color} opacity="0.9" />
        <path d="M50 35 L50 60" stroke={color} strokeWidth="5" strokeLinecap="round" />
        <path d="M50 42 L20 30 L10 20" stroke={color} strokeWidth="5" strokeLinecap="round" fill="none" />
        <path d="M50 42 L80 30 L90 15" stroke={color} strokeWidth="5" strokeLinecap="round" fill="none" />
        <path d="M50 60 L30 85 L25 100" stroke={color} strokeWidth="5" strokeLinecap="round" fill="none" />
        <path d="M50 60 L70 80 L75 95" stroke={color} strokeWidth="5" strokeLinecap="round" fill="none" />
        <ellipse cx="25" cy="105" rx="10" ry="3" fill={color} opacity="0.3" />
        <ellipse cx="75" cy="98" rx="10" ry="3" fill={color} opacity="0.3" />
      </svg>
    ),
    squat: (
      <svg viewBox="0 0 100 140" fill="none" className="w-full h-full">
        <circle cx="50" cy="35" r="10" fill={color} opacity="0.9" />
        <path d="M50 45 L50 70" stroke={color} strokeWidth="5" strokeLinecap="round" />
        <path d="M50 55 L25 60 L15 50" stroke={color} strokeWidth="5" strokeLinecap="round" fill="none" />
        <path d="M50 55 L75 60 L85 50" stroke={color} strokeWidth="5" strokeLinecap="round" fill="none" />
        <path d="M50 70 L40 100 L35 125" stroke={color} strokeWidth="5" strokeLinecap="round" fill="none" />
        <path d="M50 70 L60 100 L65 125" stroke={color} strokeWidth="5" strokeLinecap="round" fill="none" />
      </svg>
    ),
    stretch: (
      <svg viewBox="0 0 100 140" fill="none" className="w-full h-full">
        <circle cx="50" cy="20" r="10" fill={color} opacity="0.9" />
        <path d="M50 30 L50 55" stroke={color} strokeWidth="5" strokeLinecap="round" />
        <path d="M50 40 L20 35 L5 25" stroke={color} strokeWidth="5" strokeLinecap="round" fill="none" />
        <path d="M50 40 L80 30 L95 20" stroke={color} strokeWidth="5" strokeLinecap="round" fill="none" />
        <path d="M50 55 L45 90 L40 130" stroke={color} strokeWidth="5" strokeLinecap="round" fill="none" />
        <path d="M50 55 L58 88 L65 125" stroke={color} strokeWidth="5" strokeLinecap="round" fill="none" />
      </svg>
    ),
    kick: (
      <svg viewBox="0 0 100 140" fill="none" className="w-full h-full">
        <circle cx="50" cy="20" r="10" fill={color} opacity="0.9" />
        <path d="M50 30 L50 55" stroke={color} strokeWidth="5" strokeLinecap="round" />
        <path d="M50 40 L25 35 L10 40" stroke={color} strokeWidth="5" strokeLinecap="round" fill="none" />
        <path d="M50 40 L75 38 L90 30" stroke={color} strokeWidth="5" strokeLinecap="round" fill="none" />
        <path d="M50 55 L40 85 L35 120" stroke={color} strokeWidth="5" strokeLinecap="round" fill="none" />
        <path d="M50 55 L70 70 L85 55" stroke={color} strokeWidth="5" strokeLinecap="round" fill="none" />
        <ellipse cx="85" cy="50" rx="12" ry="4" fill={color} opacity="0.3" />
      </svg>
    ),
  };

  return poses[pose] || null;
}

function Particle({ delay, duration, x, size }: { delay: number; duration: number; x: number; size: number }) {
  return (
    <div
      className="absolute rounded-full opacity-20"
      style={{
        left: `${x}%`,
        width: size,
        height: size,
        background: "currentColor",
        animation: `floatParticle ${duration}s ease-in-out ${delay}s infinite`,
      }}
    />
  );
}

export default function FitnessBackground() {
  const [sceneIndex, setSceneIndex] = useState(0);
  const scene = scenes[sceneIndex];

  useEffect(() => {
    const interval = setInterval(() => {
      setSceneIndex((i) => (i + 1) % scenes.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const particles = Array.from({ length: 20 }, (_, i) => ({
    delay: Math.random() * 5,
    duration: 4 + Math.random() * 6,
    x: Math.random() * 100,
    size: 2 + Math.random() * 4,
  }));

  return (
    <div className="fixed inset-0 overflow-hidden -z-10">
      {/* Animated gradient background */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${scene.gradient} transition-all duration-[3000ms]`}
      />

      {/* Overlay pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
        backgroundSize: "40px 40px",
      }} />

      {/* Floating particles */}
      <div className="absolute inset-0" style={{ color: scene.accent }}>
        {particles.map((p, i) => (
          <Particle key={i} {...p} />
        ))}
      </div>

      {/* Fitness figures */}
      {scene.figures.map((fig, i) => (
        <div
          key={`${scene.id}-${i}`}
          className="absolute transition-all duration-[3000ms] ease-in-out"
          style={{
            left: `${fig.x}%`,
            top: `${fig.y}%`,
            width: `${fig.scale * 120}px`,
            height: `${fig.scale * 168}px`,
            transform: "translate(-50%, -50%)",
            animation: `figurePulse 4s ease-in-out ${fig.delay}s infinite`,
            opacity: 0.25,
            filter: `drop-shadow(0 0 20px ${scene.accent}40)`,
          }}
        >
          <FigureSVG pose={fig.pose} color={scene.accent} />
        </div>
      ))}

      {/* Vignette overlay */}
      <div className="absolute inset-0" style={{
        background: "radial-gradient(ellipse at center, transparent 0%, transparent 40%, rgba(0,0,0,0.4) 100%)",
      }} />

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-black/60 to-transparent" />

      {/* Scene label */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center">
        <p
          className="text-sm font-medium tracking-widest uppercase transition-all duration-1000"
          style={{ color: scene.accent, opacity: 0.6 }}
        >
          {scene.label}
        </p>
      </div>

      {/* Scene indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {scenes.map((_, i) => (
          <div
            key={i}
            className="h-1 rounded-full transition-all duration-500"
            style={{
              width: i === sceneIndex ? 24 : 8,
              backgroundColor: i === sceneIndex ? scene.accent : "rgba(255,255,255,0.2)",
            }}
          />
        ))}
      </div>

    </div>
  );
}
