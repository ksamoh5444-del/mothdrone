/**
 * MissionControl.tsx
 * ─────────────────────────────────────────────────────────────────
 * DESIGN: Tactical Precision / Defense-Grade HMI
 * Arabic RTL dashboard with live telemetry simulations.
 * Technical terms (GaN, KVI-3, Phased Array, HPM, etc.) remain in English.
 *
 * Layout: scrollable right-side panel, 35% of viewport width.
 */

import { useEffect, useRef, useState } from 'react';
import { SceneMode } from './MothdroneScene';

// ─── Telemetry hook ───────────────────────────────────────────────
function useTelemetry(mode: SceneMode) {
  const [chargeLevel, setChargeLevel] = useState(0);
  const [ganTemp, setGanTemp] = useState(42);
  const [beamAngle, setBeamAngle] = useState(0);
  const [targetRange, setTargetRange] = useState(1200);
  const [systemStatus, setSystemStatus] = useState<'STANDBY' | 'CHARGING' | 'READY' | 'FIRING'>('STANDBY');
  const chargeRef = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const dt = 0.08;

      setChargeLevel((prev) => {
        let next = prev;
        if (mode === 'attack') {
          next = Math.min(100, prev + 4);
        } else if (mode === 'normal' || mode === 'presentation') {
          next = prev + 1.5;
          if (next >= 100) next = 0;
        } else if (mode === 'exploded') {
          next = 65; // static during inspection
        }
        chargeRef.current = next;
        return next;
      });

      setGanTemp((prev) => {
        if (mode === 'attack') return Math.min(188, prev + 3.2);
        if (mode === 'normal') return 42 + Math.sin(Date.now() / 3000) * 9;
        return Math.max(42, prev - 0.8);
      });

      setBeamAngle((prev) => (prev + 2.8) % 360);

      setTargetRange((prev) => {
        if (mode === 'attack') return Math.max(0, prev - 18);
        return 1200 + Math.sin(Date.now() / 5000) * 120;
      });

      setSystemStatus(() => {
        if (mode === 'attack') return 'FIRING';
        if (mode === 'presentation') return 'READY';
        const c = chargeRef.current;
        if (c > 85) return 'READY';
        if (c > 8) return 'CHARGING';
        return 'STANDBY';
      });
    }, 80);

    return () => clearInterval(interval);
  }, [mode]);

  return { chargeLevel, ganTemp, beamAngle, targetRange, systemStatus };
}

// ─── Radar sweep ──────────────────────────────────────────────────
function RadarDisplay({ angle }: { angle: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const r = w / 2 - 3;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#040c18';
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    // Rings
    [0.33, 0.66, 1].forEach((s) => {
      ctx.strokeStyle = 'rgba(59,130,246,0.18)';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.arc(cx, cy, r * s, 0, Math.PI * 2);
      ctx.stroke();
    });

    // Cross
    ctx.strokeStyle = 'rgba(59,130,246,0.12)';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(cx - r, cy); ctx.lineTo(cx + r, cy);
    ctx.moveTo(cx, cy - r); ctx.lineTo(cx, cy + r);
    ctx.stroke();

    // Sweep
    const sweepAngle = (angle * Math.PI) / 180;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(sweepAngle);
    const grad = ctx.createLinearGradient(0, 0, r, 0);
    grad.addColorStop(0, 'rgba(59,130,246,0.55)');
    grad.addColorStop(1, 'rgba(59,130,246,0)');
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, r, -0.45, 0.45);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();
    // Sweep line
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 1.5;
    ctx.shadowColor = '#3b82f6';
    ctx.shadowBlur = 5;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(r, 0);
    ctx.stroke();
    ctx.restore();

    // Center
    ctx.fillStyle = '#3b82f6';
    ctx.shadowColor = '#3b82f6';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.arc(cx, cy, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Target blip
    const blipAngle = (angle * 0.68 * Math.PI) / 180;
    const blipR = r * 0.58;
    ctx.fillStyle = '#ef4444';
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(cx + Math.cos(blipAngle) * blipR, cy + Math.sin(blipAngle) * blipR, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }, [angle]);

  return <canvas ref={canvasRef} width={96} height={96} style={{ borderRadius: '50%', display: 'block' }} />;
}

// ─── Thermal gauge ────────────────────────────────────────────────
function ThermalGauge({ temp }: { temp: number }) {
  const pct = Math.min(100, ((temp - 40) / 160) * 100);
  const color = pct < 40 ? '#22c55e' : pct < 70 ? '#f59e0b' : '#ef4444';
  const modules = [temp - 14, temp - 6, temp, temp + 9, temp + 17, temp + 26];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: 'JetBrains Mono', fontSize: '8px', color: '#4b5563' }}>GaN TEMP</span>
        <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color, fontWeight: 700 }}>
          {temp.toFixed(1)}°C
        </span>
      </div>
      {/* Main bar */}
      <div style={{ height: '5px', background: '#0f172a', borderRadius: '1px', overflow: 'hidden', border: `1px solid ${color}22` }}>
        <div style={{
          height: '100%', width: `${pct}%`,
          background: `linear-gradient(90deg, #22c55e, ${color})`,
          transition: 'width 0.3s, background 0.3s',
          boxShadow: `0 0 5px ${color}66`,
        }} />
      </div>
      {/* Module heat bars */}
      <div style={{ display: 'flex', gap: '3px' }}>
        {modules.map((t, i) => {
          const p = Math.min(100, ((t - 40) / 160) * 100);
          const c = p < 40 ? '#22c55e' : p < 70 ? '#f59e0b' : '#ef4444';
          return (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: '6px', color: c }}>{t.toFixed(0)}°</div>
              <div style={{ width: '100%', height: '18px', background: '#0a0f1a', borderRadius: '1px', overflow: 'hidden', display: 'flex', alignItems: 'flex-end' }}>
                <div style={{ width: '100%', height: `${p}%`, background: c, transition: 'height 0.3s' }} />
              </div>
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: '6px', color: '#374151' }}>M{i + 1}</div>
            </div>
          );
        })}
      </div>
      {/* Gradient reference bar */}
      <div style={{ height: '3px', background: 'linear-gradient(90deg, #1e40af, #22c55e, #f59e0b, #ef4444)', borderRadius: '1px', opacity: 0.35 }} />
    </div>
  );
}

// ─── Charge bar ───────────────────────────────────────────────────
function ChargeBar({ level, status }: { level: number; status: string }) {
  const color = status === 'READY' || status === 'FIRING' ? '#3b82f6'
    : status === 'CHARGING' ? '#f59e0b' : '#374151';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: 'JetBrains Mono', fontSize: '8px', color: '#4b5563' }}>HPM CHARGE</span>
        <span style={{ fontFamily: 'JetBrains Mono', fontSize: '11px', color, fontWeight: 700 }}>
          {level.toFixed(0)}%
        </span>
      </div>
      {/* Main bar */}
      <div style={{ height: '7px', background: '#0f172a', borderRadius: '1px', overflow: 'hidden', border: `1px solid ${color}33` }}>
        <div style={{
          height: '100%', width: `${level}%`,
          background: color,
          transition: 'width 0.15s',
          boxShadow: `0 0 8px ${color}88`,
        }} />
      </div>
      {/* Segment ticks */}
      <div style={{ display: 'flex', gap: '1px', height: '3px' }}>
        {Array.from({ length: 20 }, (_, i) => (
          <div key={i} style={{
            flex: 1,
            background: i < level / 5 ? color : '#1e293b',
            transition: 'background 0.15s',
          }} />
        ))}
      </div>
    </div>
  );
}

// ─── Panel wrapper ────────────────────────────────────────────────
function Panel({
  title, titleEn, children, color = '#3b82f6',
}: {
  title: string; titleEn?: string; children: React.ReactNode; color?: string;
}) {
  return (
    <div style={{
      border: `1px solid ${color}28`,
      borderRadius: '2px',
      padding: '10px 11px',
      background: 'rgba(4,8,18,0.6)',
      position: 'relative',
    }}>
      {/* Corner brackets */}
      {[
        { top: 0, left: 0, borderWidth: '1px 0 0 1px' },
        { top: 0, right: 0, borderWidth: '1px 1px 0 0' },
        { bottom: 0, left: 0, borderWidth: '0 0 1px 1px' },
        { bottom: 0, right: 0, borderWidth: '0 1px 1px 0' },
      ].map((s, i) => (
        <div key={i} style={{
          position: 'absolute', width: '8px', height: '8px',
          borderColor: color, borderStyle: 'solid', ...s,
        }} />
      ))}
      <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: 'IBM Plex Sans Arabic', fontSize: '11px', color, fontWeight: 600 }}>{title}</span>
        {titleEn && (
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: '7px', color: `${color}66`, letterSpacing: '0.12em' }}>
            {titleEn}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

// ─── Data cell ────────────────────────────────────────────────────
function DataCell({ label, value, color = '#94a3b8' }: { label: string; value: string; color?: string }) {
  return (
    <div style={{ background: '#040a14', padding: '5px 7px', borderRadius: '1px', border: '1px solid #0f1e2e' }}>
      <div style={{ fontFamily: 'IBM Plex Sans Arabic', fontSize: '8px', color: '#374151', marginBottom: '2px', direction: 'rtl' }}>{label}</div>
      <div style={{ fontFamily: 'JetBrains Mono', fontSize: '10px', color, fontWeight: 600, direction: 'ltr' }}>{value}</div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────
interface MissionControlProps {
  mode: SceneMode;
  onModeChange: (mode: SceneMode) => void;
  radomeOpacity: number;
  onRadomeOpacityChange: (v: number) => void;
  showAnnotations: boolean;
  onAnnotationsChange: (v: boolean) => void;
}

export default function MissionControl({
  mode,
  onModeChange,
  radomeOpacity,
  onRadomeOpacityChange,
  showAnnotations,
  onAnnotationsChange,
}: MissionControlProps) {
  const { chargeLevel, ganTemp, beamAngle, targetRange, systemStatus } = useTelemetry(mode);
  const [time, setTime] = useState('');

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(now.toISOString().replace('T', ' ').slice(0, 19) + ' UTC');
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const statusColor: Record<string, string> = {
    STANDBY: '#4b5563',
    CHARGING: '#f59e0b',
    READY: '#3b82f6',
    FIRING: '#ef4444',
  };
  const sc = statusColor[systemStatus] ?? '#4b5563';

  return (
    <div style={{
      width: '100%',
      height: '100%',
      background: 'rgba(4, 8, 20, 0.97)',
      borderLeft: '1px solid rgba(59,130,246,0.15)',
      display: 'flex',
      flexDirection: 'column',
      gap: '7px',
      padding: '10px 12px',
      overflowY: 'auto',
      direction: 'rtl',
    }}>

      {/* ── Header ─────────────────────────────────────────────── */}
      <div style={{ borderBottom: '1px solid rgba(59,130,246,0.15)', paddingBottom: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ fontFamily: 'IBM Plex Sans Arabic', fontSize: '15px', fontWeight: 700, color: '#e2e8f0' }}>
              نظام MOTH-HPM
            </div>
            <div style={{ fontFamily: 'JetBrains Mono', fontSize: '8px', color: '#3b82f6', letterSpacing: '0.12em', marginTop: '2px', direction: 'ltr' }}>
              INTERCEPTOR CONTROL SYSTEM
            </div>
          </div>
          <div style={{ textAlign: 'left', direction: 'ltr' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <div style={{
                width: '7px', height: '7px', borderRadius: '50%',
                background: sc, boxShadow: `0 0 8px ${sc}`,
                animation: systemStatus !== 'STANDBY' ? 'pulse-dot 1.2s infinite' : 'none',
              }} />
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', color: sc, fontWeight: 700, letterSpacing: '0.1em' }}>
                {systemStatus}
              </span>
            </div>
            <div style={{ fontFamily: 'JetBrains Mono', fontSize: '7px', color: '#1e293b', marginTop: '3px' }}>
              {time}
            </div>
          </div>
        </div>

        {/* System ID strip */}
        <div style={{ display: 'flex', gap: '5px', marginTop: '7px', flexWrap: 'wrap', direction: 'ltr' }}>
          {[
            { k: 'SYS', v: 'MOTH-01' },
            { k: 'REV', v: 'v2.4.1' },
            { k: 'MODE', v: mode.toUpperCase() },
            { k: 'FREQ', v: '9.4 GHz' },
          ].map(({ k, v }) => (
            <div key={k} style={{
              fontFamily: 'JetBrains Mono', fontSize: '7px',
              color: '#4b5563', background: '#070d1a',
              padding: '2px 6px', borderRadius: '1px',
              border: '1px solid #0f1e2e',
            }}>
              <span style={{ color: '#1e293b' }}>{k}:</span>{' '}
              <span style={{ color: '#64748b' }}>{v}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── HPM Status ─────────────────────────────────────────── */}
      <Panel title="حالة HPM" titleEn="HPM STATUS" color="#3b82f6">
        <ChargeBar level={chargeLevel} status={systemStatus} />
        <div style={{ marginTop: '8px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '5px', direction: 'ltr' }}>
          <DataCell label="KVI-3 CAPS" value={`${(chargeLevel * 4.2).toFixed(0)} V`} color="#0d9488" />
          <DataCell label="PULSE ENERGY" value={`${(chargeLevel * 0.85).toFixed(1)} kJ`} color="#3b82f6" />
          <DataCell label="READY" value={chargeLevel >= 95 ? '● YES' : '○ NO'} color={chargeLevel >= 95 ? '#3b82f6' : '#374151'} />
        </div>
      </Panel>

      {/* ── Thermal Monitor ────────────────────────────────────── */}
      <Panel title="مراقبة الحرارة" titleEn="THERMAL MONITOR" color="#ff6b35">
        <ThermalGauge temp={ganTemp} />
        <div style={{ marginTop: '6px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px', direction: 'ltr' }}>
          <DataCell label="PEAK TEMP" value={`${(ganTemp + 26).toFixed(1)}°C`} color={ganTemp + 26 > 180 ? '#ef4444' : '#f59e0b'} />
          <DataCell label="COOLANT FLOW" value="2.4 L/min" color="#22c55e" />
        </div>
      </Panel>

      {/* ── Beam Steering ──────────────────────────────────────── */}
      <Panel title="توجيه الحزمة" titleEn="BEAM STEERING" color="#f59e0b">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', direction: 'ltr' }}>
          <RadarDisplay angle={beamAngle} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '5px' }}>
            <DataCell label="AZIMUTH" value={`${beamAngle.toFixed(1)}°`} color="#f59e0b" />
            <DataCell label="ELEVATION" value={`${(Math.sin(beamAngle * 0.02) * 15 + 5).toFixed(1)}°`} color="#f59e0b" />
            <DataCell label="ARRAY MODE" value="SCAN · Phased Array" color="#f59e0b" />
          </div>
        </div>
      </Panel>

      {/* ── Target Data ────────────────────────────────────────── */}
      <Panel title="بيانات الهدف" titleEn="TARGET DATA" color="#ef4444">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px', direction: 'ltr' }}>
          <DataCell label="النوع / TYPE" value="Shahed-136" color="#ef4444" />
          <DataCell label="المسافة / RANGE" value={`${targetRange.toFixed(0)} m`} color="#ef4444" />
          <DataCell label="السرعة / SPEED" value="185 km/h" color="#94a3b8" />
          <DataCell label="الارتفاع / ALT" value="85 m AGL" color="#94a3b8" />
          <DataCell label="الحالة / STATUS" value={mode === 'attack' ? 'LOCKED' : 'TRACKING'} color={mode === 'attack' ? '#ef4444' : '#f59e0b'} />
          <DataCell label="الإجراء / ACTION" value={mode === 'attack' ? 'FIRING' : 'STANDBY'} color={mode === 'attack' ? '#ef4444' : '#4b5563'} />
        </div>
      </Panel>

      {/* ── Tier Status ────────────────────────────────────────── */}
      <Panel title="حالة الطبقات" titleEn="TIER STATUS" color="#4b5563">
        {[
          { tier: 'T1', name: 'KVI-3 Caps', status: 'NOMINAL', color: '#0d9488', pct: Math.min(100, chargeLevel * 1.2) },
          { tier: 'T2', name: 'EMI Shield', status: 'ACTIVE', color: '#b87333', pct: 100 },
          { tier: 'T3', name: 'GaN Amps', status: ganTemp > 150 ? 'HOT' : 'NOMINAL', color: '#ff6b35', pct: Math.min(100, (ganTemp / 188) * 100) },
          { tier: 'T4', name: 'Phased Array', status: 'SCANNING', color: '#f59e0b', pct: 100 },
        ].map(({ tier, name, status, color, pct }) => (
          <div key={tier} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '5px', direction: 'ltr' }}>
            <div style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', color, width: '20px', fontWeight: 700 }}>{tier}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: '8px', color: '#64748b' }}>{name}</span>
                <span style={{ fontFamily: 'JetBrains Mono', fontSize: '7px', color }}>{status}</span>
              </div>
              <div style={{ height: '3px', background: '#0f172a', borderRadius: '1px' }}>
                <div style={{ height: '100%', width: `${pct}%`, background: color, transition: 'width 0.3s', borderRadius: '1px', boxShadow: `0 0 4px ${color}66` }} />
              </div>
            </div>
          </div>
        ))}
      </Panel>

      {/* ── Controls ───────────────────────────────────────────── */}
      <Panel title="التحكم" titleEn="CONTROLS" color="#3b82f6">
        {/* Mode buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px', marginBottom: '10px' }}>
          {([
            { id: 'normal', label: 'عرض عادي', en: 'NORMAL', cls: '' },
            { id: 'exploded', label: 'عرض مفكك', en: 'EXPLODED', cls: '' },
            { id: 'attack', label: 'تسلسل الهجوم', en: 'ATTACK SEQ', cls: 'btn-danger' },
            { id: 'presentation', label: 'وضع العرض', en: 'PRESENT.', cls: 'btn-gold' },
          ] as const).map(({ id, label, en, cls }) => (
            <button
              key={id}
              onClick={() => onModeChange(id)}
              className={`btn-tactical ${cls}${mode === id ? ' active' : ''}`}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '6px 4px', gap: '2px' }}
            >
              <span style={{ fontFamily: 'IBM Plex Sans Arabic', fontSize: '9px' }}>{label}</span>
              <span style={{ fontFamily: 'JetBrains Mono', fontSize: '7px', opacity: 0.65, letterSpacing: '0.08em' }}>{en}</span>
            </button>
          ))}
        </div>

        {/* Radome opacity */}
        <div style={{ marginBottom: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontFamily: 'IBM Plex Sans Arabic', fontSize: '9px', color: '#4b5563' }}>شفافية الغطاء الراداري</span>
            <span style={{ fontFamily: 'JetBrains Mono', fontSize: '8px', color: '#3b82f6', direction: 'ltr' }}>
              Radome: {Math.round(radomeOpacity * 100)}%
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(radomeOpacity * 100)}
            onChange={(e) => onRadomeOpacityChange(Number(e.target.value) / 100)}
            style={{ width: '100%', accentColor: '#3b82f6', height: '4px', direction: 'ltr' }}
          />
        </div>

        {/* Annotations toggle */}
        <button
          onClick={() => onAnnotationsChange(!showAnnotations)}
          className={`btn-tactical${showAnnotations ? ' active' : ''}`}
          style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 8px' }}
        >
          <span style={{ fontFamily: 'IBM Plex Sans Arabic', fontSize: '9px' }}>التعليقات التوضيحية</span>
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: '8px', direction: 'ltr' }}>
            ANNOTATIONS {showAnnotations ? 'ON' : 'OFF'}
          </span>
        </button>
      </Panel>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <div style={{ borderTop: '1px solid rgba(59,130,246,0.08)', paddingTop: '6px', marginTop: 'auto' }}>
        <div style={{ fontFamily: 'JetBrains Mono', fontSize: '7px', color: '#0f172a', textAlign: 'center', letterSpacing: '0.08em', direction: 'ltr' }}>
          MOTH-HPM · CLASSIFIED · ENGINEERING PROTOTYPE · v2.4.1
        </div>
      </div>
    </div>
  );
}
