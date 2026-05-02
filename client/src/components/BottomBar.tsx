/**
 * BottomBar.tsx
 * Bottom timeline / sequence controls bar.
 * Design: Tactical Precision / Defense-Grade HMI
 */

import { SceneMode } from './MothdroneScene';

interface BottomBarProps {
  mode: SceneMode;
  onModeChange: (mode: SceneMode) => void;
  radomeOpacity: number;
  onRadomeOpacityChange: (v: number) => void;
}

export default function BottomBar({ mode, onModeChange, radomeOpacity, onRadomeOpacityChange }: BottomBarProps) {
  return (
    <div style={{
      height: '44px',
      background: 'rgba(5, 8, 20, 0.95)',
      borderTop: '1px solid rgba(59,130,246,0.15)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 16px',
      gap: '12px',
      flexShrink: 0,
      direction: 'ltr',
    }}>
      {/* View mode quick buttons */}
      <div style={{ display: 'flex', gap: '6px' }}>
        {([
          { id: 'normal', label: 'NORMAL', icon: '◉' },
          { id: 'exploded', label: 'EXPLODED', icon: '⊞' },
          { id: 'attack', label: 'ATTACK', icon: '⚡' },
          { id: 'presentation', label: 'PRESENT', icon: '▶' },
        ] as const).map(({ id, label, icon }) => (
          <button
            key={id}
            onClick={() => onModeChange(id)}
            className={`btn-tactical${mode === id ? ' active' : ''}${id === 'attack' ? ' btn-danger' : id === 'presentation' ? ' btn-gold' : ''}`}
            style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px' }}
          >
            <span style={{ fontSize: '10px' }}>{icon}</span>
            <span style={{ fontSize: '8px', letterSpacing: '0.08em' }}>{label}</span>
          </button>
        ))}
      </div>

      {/* Divider */}
      <div style={{ width: '1px', height: '20px', background: '#1e293b' }} />

      {/* Radome opacity quick control */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontFamily: 'JetBrains Mono', fontSize: '8px', color: '#374151', whiteSpace: 'nowrap' }}>
          RADOME
        </span>
        <input
          type="range"
          min={0}
          max={100}
          value={Math.round(radomeOpacity * 100)}
          onChange={(e) => onRadomeOpacityChange(Number(e.target.value) / 100)}
          style={{ width: '80px', accentColor: '#3b82f6', height: '3px' }}
        />
        <span style={{ fontFamily: 'JetBrains Mono', fontSize: '8px', color: '#3b82f6', width: '28px' }}>
          {Math.round(radomeOpacity * 100)}%
        </span>
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Coordinate display */}
      <div style={{ display: 'flex', gap: '12px' }}>
        {[
          { label: 'X-AXIS', value: 'LONGITUDINAL', color: '#ef4444' },
          { label: 'SCALE', value: '1:100mm', color: '#6b7280' },
          { label: 'TIERS', value: '4 ACTIVE', color: '#22c55e' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: '7px', color: '#374151' }}>{label}:</span>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: '8px', color }}>{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
