'use client';

import { motion } from 'framer-motion';

const ease = [0.25, 0.46, 0.45, 0.94] as const;

// Orbital node positions (angle in degrees, distance from center)
const nodes = [
  { angle: 0, dist: 42, color: '#10A37F', delay: 0 },      // ChatGPT green
  { angle: 90, dist: 42, color: '#D4A574', delay: 0.15 },   // Claude warm
  { angle: 180, dist: 42, color: '#4285F4', delay: 0.3 },   // Gemini blue
  { angle: 270, dist: 42, color: '#20808D', delay: 0.45 },   // Perplexity teal
];

function toXY(angle: number, dist: number, cx: number, cy: number) {
  const rad = (angle * Math.PI) / 180;
  return { x: cx + dist * Math.cos(rad), y: cy + dist * Math.sin(rad) };
}

export function AnimatedHeroIcon({ size = 120 }: { size?: number }) {
  const cx = 60;
  const cy = 60;
  const viewBox = '0 0 120 120';

  return (
    <motion.div
      className="mx-auto"
      style={{ width: size, height: size }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease }}
    >
      <svg viewBox={viewBox} width={size} height={size} fill="none">
        <defs>
          {/* Center glow */}
          <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#818CF8" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#818CF8" stopOpacity="0" />
          </radialGradient>

          {/* Orbital ring gradient */}
          <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.2" />
            <stop offset="50%" stopColor="#06B6D4" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#4F46E5" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {/* Background glow */}
        <motion.circle
          cx={cx}
          cy={cy}
          r="55"
          fill="url(#centerGlow)"
          animate={{ r: [52, 56, 52] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Orbital ring */}
        <motion.circle
          cx={cx}
          cy={cy}
          r="42"
          stroke="url(#ringGrad)"
          strokeWidth="1"
          fill="none"
          initial={{ pathLength: 0, rotate: 0 }}
          animate={{ pathLength: 1, rotate: 360 }}
          transition={{
            pathLength: { duration: 1.5, ease },
            rotate: { duration: 60, repeat: Infinity, ease: 'linear' },
          }}
          style={{ originX: '50%', originY: '50%' }}
        />

        {/* Second orbital ring — offset */}
        <motion.circle
          cx={cx}
          cy={cy}
          r="42"
          stroke="url(#ringGrad)"
          strokeWidth="0.5"
          strokeDasharray="4 8"
          fill="none"
          animate={{ rotate: -360 }}
          transition={{ duration: 45, repeat: Infinity, ease: 'linear' }}
          style={{ originX: '50%', originY: '50%' }}
        />

        {/* Connection lines from center to nodes */}
        {nodes.map((node, i) => {
          const pos = toXY(node.angle, node.dist, cx, cy);
          return (
            <motion.line
              key={`line-${i}`}
              x1={cx}
              y1={cy}
              x2={pos.x}
              y2={pos.y}
              stroke={node.color}
              strokeWidth="1"
              strokeOpacity="0.25"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.6, delay: 0.8 + node.delay, ease }}
            />
          );
        })}

        {/* Traveling pulses along connections */}
        {nodes.map((node, i) => {
          const pos = toXY(node.angle, node.dist, cx, cy);
          return (
            <motion.circle
              key={`pulse-${i}`}
              r="1.5"
              fill={node.color}
              fillOpacity="0.6"
              initial={{ cx: cx, cy: cy }}
              animate={{
                cx: [cx, pos.x, cx],
                cy: [cy, pos.y, cy],
              }}
              transition={{
                duration: 3,
                delay: 1.5 + node.delay * 2,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          );
        })}

        {/* Center icon — user silhouette */}
        <motion.g
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4, ease }}
          style={{ originX: `${cx}px`, originY: `${cy}px` }}
        >
          {/* Center circle background */}
          <circle cx={cx} cy={cy} r="18" fill="#1E1B4B" fillOpacity="0.8" />
          <circle cx={cx} cy={cy} r="18" stroke="#818CF8" strokeWidth="1" strokeOpacity="0.3" />

          {/* User icon */}
          <motion.g
            animate={{ y: [0, -0.5, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <circle cx={cx} cy={cy - 3} r="5" fill="#818CF8" fillOpacity="0.9" />
            <path
              d={`M${cx - 8},${cy + 10} Q${cx - 8},${cy + 2} ${cx},${cy + 2} Q${cx + 8},${cy + 2} ${cx + 8},${cy + 10}`}
              fill="#818CF8"
              fillOpacity="0.7"
            />
          </motion.g>
        </motion.g>

        {/* Orbital nodes */}
        {nodes.map((node, i) => {
          const pos = toXY(node.angle, node.dist, cx, cy);
          return (
            <motion.g key={`node-${i}`}>
              {/* Glow */}
              <motion.circle
                cx={pos.x}
                cy={pos.y}
                r="8"
                fill={node.color}
                fillOpacity="0.1"
                animate={{ r: [7, 9, 7], fillOpacity: [0.08, 0.15, 0.08] }}
                transition={{
                  duration: 2.5,
                  delay: node.delay,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
              {/* Node dot */}
              <motion.circle
                cx={pos.x}
                cy={pos.y}
                r="4"
                fill={node.color}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                  type: 'spring',
                  stiffness: 400,
                  damping: 20,
                  delay: 1 + node.delay,
                }}
                style={{ originX: `${pos.x}px`, originY: `${pos.y}px` }}
              />
              {/* Bright center */}
              <motion.circle
                cx={pos.x}
                cy={pos.y}
                r="1.5"
                fill="white"
                fillOpacity="0.8"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1.1 + node.delay }}
              />
            </motion.g>
          );
        })}

        {/* Sparkle accents */}
        {[
          { x: 25, y: 22, delay: 2, size: 2 },
          { x: 95, y: 30, delay: 2.8, size: 1.5 },
          { x: 88, y: 92, delay: 3.5, size: 2 },
          { x: 18, y: 85, delay: 4.2, size: 1.5 },
        ].map((sparkle, i) => (
          <motion.circle
            key={`sparkle-${i}`}
            cx={sparkle.x}
            cy={sparkle.y}
            r={sparkle.size}
            fill="white"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.6, 0] }}
            transition={{
              duration: 2,
              delay: sparkle.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </svg>
    </motion.div>
  );
}
