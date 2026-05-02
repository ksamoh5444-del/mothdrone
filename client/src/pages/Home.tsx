/**
 * Home.tsx — Mothdrone HPM Interceptor Visualizer
 * ─────────────────────────────────────────────────────────────────
 * DESIGN: Tactical Precision / Defense-Grade HMI
 * Layout: Full-viewport split — 65% 3D canvas (left) + 35% mission control (right)
 * Top bar: system status strip | Bottom bar: sequence controls
 */

import { useState, Suspense } from 'react';
import MothdroneScene, { SceneMode } from '@/components/MothdroneScene';
import MissionControl from '@/components/MissionControl';
import TopBar from '@/components/TopBar';
import BottomBar from '@/components/BottomBar';

function LoadingFallback() {
  return (
    <div style={{
      width: '100%', height: '100%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#f8fafc',
      flexDirection: 'column', gap: '14px',
    }}>
      <div style={{
        width: '36px', height: '36px',
        border: '2px solid rgba(59,130,246,0.2)',
        borderTop: '2px solid #3b82f6',
        borderRadius: '50%',
        animation: 'spin 0.9s linear infinite',
      }} />
      <div style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', color: '#0f172a', letterSpacing: '0.18em' }}>
        INITIALIZING 3D ENGINE
      </div>
      <div style={{ display: 'flex', gap: '4px' }}>
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} style={{
            width: '4px', height: '4px', borderRadius: '50%',
            background: '#0f172a',
            animation: `pulse-dot 1s ${i * 0.15}s infinite`,
          }} />
        ))}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ─── Tactical viewport overlay ────────────────────────────────────
function ViewportOverlay({ mode }: { mode: SceneMode }) {
  const modeLabels: Record<SceneMode, string> = {
    normal: 'DRAG TO ROTATE · SCROLL TO ZOOM · AUTO-ROTATE ACTIVE',
    exploded: 'EXPLODED VIEW · COMPONENT INSPECTION MODE · Z-AXIS SEPARATION',
    attack: 'ATTACK SEQUENCE · HPM BEAM ACTIVE · SHAHED-136 ENGAGED',
    presentation: 'PRESENTATION MODE · ORBITAL SCAN · 360° ROTATION',
  };
  const modeColors: Record<SceneMode, string> = {
    normal: 'rgba(59,130,246,0.4)',
    exploded: 'rgba(245,158,11,0.4)',
    attack: 'rgba(239,68,68,0.5)',
    presentation: 'rgba(168,85,247,0.4)',
  };

  return (
    <>
      {/* Corner brackets */}
      {[
        { top: '10px', left: '10px', borderWidth: '1.5px 0 0 1.5px' },
        { top: '10px', right: '10px', borderWidth: '1.5px 1.5px 0 0' },
        { bottom: '10px', left: '10px', borderWidth: '0 0 1.5px 1.5px' },
        { bottom: '10px', right: '10px', borderWidth: '0 1.5px 1.5px 0' },
      ].map((s, i) => (
        <div key={i} style={{
          position: 'absolute', width: '18px', height: '18px',
          borderColor: 'rgba(59,130,246,0.35)', borderStyle: 'solid',
          zIndex: 5, pointerEvents: 'none', ...s,
        }} />
      ))}

      {/* Top label */}
      <div style={{
        position: 'absolute', top: '14px', left: '34px',
        fontFamily: 'JetBrains Mono', fontSize: '8px',
        color: 'rgba(59,130,246,0.5)',
        letterSpacing: '0.14em',
        zIndex: 5, pointerEvents: 'none',
      }}>
        3D VIEWPORT · MOTH-HPM PAYLOAD · X-AXIS LONGITUDINAL
      </div>

      {/* Top right: coordinate system indicator */}
      <div style={{
        position: 'absolute', top: '14px', right: '34px',
        fontFamily: 'JetBrains Mono', fontSize: '7px',
        color: 'rgba(59,130,246,0.4)',
        letterSpacing: '0.1em',
        zIndex: 5, pointerEvents: 'none',
        textAlign: 'right',
      }}>
        <span style={{ color: 'rgba(239,68,68,0.6)' }}>X</span>
        {' '}·{' '}
        <span style={{ color: 'rgba(34,197,94,0.6)' }}>Y</span>
        {' '}·{' '}
        <span style={{ color: 'rgba(59,130,246,0.6)' }}>Z</span>
        {' '}| 1u = 100mm
      </div>

      {/* Bottom label */}
      <div style={{
        position: 'absolute', bottom: '14px', left: '34px',
        fontFamily: 'JetBrains Mono', fontSize: '8px',
        color: modeColors[mode],
        letterSpacing: '0.1em',
        zIndex: 5, pointerEvents: 'none',
      }}>
        {modeLabels[mode]}
      </div>

      {/* Bottom right: scale bar */}
      <div style={{
        position: 'absolute', bottom: '14px', right: '34px',
        zIndex: 5, pointerEvents: 'none',
        display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <div style={{ width: '40px', height: '2px', background: 'rgba(59,130,246,0.4)', position: 'relative' }}>
            <div style={{ position: 'absolute', left: 0, top: '-3px', width: '1px', height: '8px', background: 'rgba(59,130,246,0.5)' }} />
            <div style={{ position: 'absolute', right: 0, top: '-3px', width: '1px', height: '8px', background: 'rgba(59,130,246,0.5)' }} />
          </div>
          <span style={{ fontFamily: 'JetBrains Mono', fontSize: '7px', color: 'rgba(59,130,246,0.4)' }}>500mm</span>
        </div>
      </div>

      {/* Scanline overlay */}
      <div className="scanline-overlay" />

      {/* Vignette */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at 40% 50%, transparent 40%, rgba(255,255,255,0.15) 100%)',
        pointerEvents: 'none',
        zIndex: 2,
      }} />
    </>
  );
}

export default function Home() {
  const [mode, setMode] = useState<SceneMode>('normal');
  const [radomeOpacity, setRadomeOpacity] = useState(0.35);
  const [showAnnotations, setShowAnnotations] = useState(false);

  const handleModeChange = (newMode: SceneMode) => {
    setMode(newMode);
    if (newMode === 'presentation') {
      setShowAnnotations(true);
      setRadomeOpacity(0.12);
    } else if (newMode === 'exploded') {
      setShowAnnotations(true);
      setRadomeOpacity(0.0);
    } else if (newMode === 'attack') {
      setShowAnnotations(false);
      setRadomeOpacity(0.0);
    } else {
      setShowAnnotations(false);
      setRadomeOpacity(0.35);
    }
  };

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: '#ffffff',
      overflow: 'hidden',
    }}>
      {/* Top status bar */}
      <TopBar mode={mode} />

      {/* Main content */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>

        {/* 3D Canvas (65%) */}
        <div style={{ flex: '0 0 65%', position: 'relative', overflow: 'hidden', background: '#f8fafc' }}>
          {/* Canvas background gradient */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse 80% 60% at 45% 50%, rgba(226,232,240,0.3) 0%, rgba(248,250,252,1) 75%)',
            pointerEvents: 'none',
            zIndex: 1,
          }} />

          {/* Tactical overlay elements */}
          <ViewportOverlay mode={mode} />

          {/* Three.js Canvas */}
          <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
            <Suspense fallback={<LoadingFallback />}>
              <MothdroneScene
                mode={mode}
                radomeOpacity={radomeOpacity}
                showAnnotations={showAnnotations}
                onModeChange={handleModeChange}
              />
            </Suspense>
          </div>
        </div>

        {/* Mission Control Sidebar (35%) */}
        <div style={{ flex: '0 0 35%', overflow: 'hidden', minHeight: 0 }}>
          <MissionControl
            mode={mode}
            onModeChange={handleModeChange}
            radomeOpacity={radomeOpacity}
            onRadomeOpacityChange={setRadomeOpacity}
            showAnnotations={showAnnotations}
            onAnnotationsChange={setShowAnnotations}
          />
        </div>
      </div>

      {/* Bottom controls bar */}
      <BottomBar
        mode={mode}
        onModeChange={handleModeChange}
        radomeOpacity={radomeOpacity}
        onRadomeOpacityChange={setRadomeOpacity}
      />
    </div>
  );
}
