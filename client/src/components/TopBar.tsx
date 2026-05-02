/**
 * TopBar.tsx
 * System status strip at the top of the viewport.
 * Design: Tactical Precision / Defense-Grade HMI
 */

import { useEffect, useState } from 'react';
import { SceneMode } from './MothdroneScene';

interface TopBarProps {
  mode: SceneMode;
}

export default function TopBar({ mode }: TopBarProps) {
  const [uptime, setUptime] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setUptime((p) => p + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const fmt = (s: number) => {
    const h = Math.floor(s / 3600).toString().padStart(2, '0');
    const m = Math.floor((s % 3600) / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${h}:${m}:${sec}`;
  };

  const modeColor: Record<SceneMode, string> = {
    normal: '#3b82f6',
    exploded: '#f59e0b',
    attack: '#ef4444',
    presentation: '#a855f7',
  };

  return (
    <div style={{
      height: '36px',
      background: 'rgba(5, 8, 20, 0.95)',
      borderBottom: '1px solid rgba(59,130,246,0.2)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 16px',
      gap: '20px',
      flexShrink: 0,
      direction: 'ltr',
    }}>
      {/* Logo / System ID */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div style={{
          width: '20px', height: '20px',
          border: '1.5px solid #3b82f6',
          borderRadius: '2px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(59,130,246,0.1)',
        }}>
          <div style={{ width: '8px', height: '8px', background: '#3b82f6', borderRadius: '1px' }} />
        </div>
        <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', fontWeight: 700, color: '#e2e8f0', letterSpacing: '0.12em' }}>
          MOTH-HPM
        </span>
        <span style={{ fontFamily: 'JetBrains Mono', fontSize: '8px', color: '#374151', letterSpacing: '0.08em' }}>
          INTERCEPTOR VISUALIZER
        </span>
      </div>

      {/* Divider */}
      <div style={{ width: '1px', height: '18px', background: '#1e293b' }} />

      {/* Mode indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
        <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: modeColor[mode], boxShadow: `0 0 6px ${modeColor[mode]}` }} />
        <span style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', color: modeColor[mode], letterSpacing: '0.1em' }}>
          MODE: {mode.toUpperCase()}
        </span>
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Status indicators */}
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
        {[
          { label: 'RADAR', status: 'ACTIVE', color: '#22c55e' },
          { label: 'COMMS', status: 'SECURE', color: '#22c55e' },
          { label: 'POWER', status: '98%', color: '#3b82f6' },
        ].map(({ label, status, color }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: color, animation: 'pulse-dot 2s infinite' }} />
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: '8px', color: '#374151' }}>{label}:</span>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: '8px', color }}>{status}</span>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div style={{ width: '1px', height: '18px', background: '#1e293b' }} />

      {/* Uptime */}
      <div style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', color: '#374151' }}>
        UP: <span style={{ color: '#4b5563' }}>{fmt(uptime)}</span>
      </div>
    </div>
  );
}
