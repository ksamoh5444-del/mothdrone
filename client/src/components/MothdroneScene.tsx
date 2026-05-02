/**
 * MothdroneScene.tsx — Engineering-Grade HPM Interceptor Visualizer
 * ─────────────────────────────────────────────────────────────────
 * CORRECT ENERGY KILL CHAIN (BASE → APEX):
 *
 * External Power: Drone main battery → Tier 1 (slow DC charge)
 *
 * Tier 1 (0–200mm): KVI-3 Capacitor Matrix
 *   - Receives DC from drone battery
 *   - Stores energy
 *   - PULSES high-voltage discharge on command
 *
 * Tier 2 (200–205mm): Copper EMI Shield (Faraday Bulkhead)
 *   - Blocks EM backscatter
 *   - Protects drone avionics from own weapon
 *
 * Tier 3 (205–350mm): GaN Amplifiers + Cooling Fins
 *   - Receives HIGH-VOLTAGE PULSE from Tier 1
 *   - Converts pulse to high-frequency microwaves
 *   - Amplifies RF signal
 *   - Dissipates intense heat via fins
 *
 * Tier 4 (350–500mm): Conformal Phased Array Antenna
 *   - Receives amplified RF from Tier 3 via waveguide
 *   - Acts as directional lens (NOT a power source)
 *   - Emits/steers focused HPM beam toward target
 *
 * ENERGY FLOW: Tier 1 (PULSE) → Tier 3 (AMPLIFY) → Tier 4 (EMIT)
 */

import { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Html } from '@react-three/drei';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { InterconnectsLayer } from './InterconnectsLayer';

export type SceneMode = 'normal' | 'exploded' | 'attack' | 'presentation';

interface SceneProps {
  mode: SceneMode;
  radomeOpacity: number;
  showAnnotations: boolean;
  onModeChange?: (mode: SceneMode) => void;
}

// ─── Precise Ogive Nose Cone ──────────────────────────────────────
function createPreciseOgiveGeometry(length: number, baseRadius: number, segments = 128): THREE.BufferGeometry {
  const profilePoints: THREE.Vector2[] = [];
  const rho = (baseRadius * baseRadius + length * length) / (2 * baseRadius);

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const x = t * length;
    const discriminant = rho * rho - (length - x) * (length - x);
    const r = discriminant >= 0 ? Math.sqrt(discriminant) - (rho - baseRadius) : 0;
    profilePoints.push(new THREE.Vector2(Math.max(0, r), x));
  }

  const geo = new THREE.LatheGeometry(profilePoints, 144);
  geo.applyMatrix4(new THREE.Matrix4().makeRotationZ(-Math.PI / 2));
  return geo;
}

// ─── Animated Group ───────────────────────────────────────────────
function AnimatedGroup({
  children,
  targetX,
}: {
  children: React.ReactNode;
  targetX: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const currentX = useRef(0);

  useEffect(() => {
    if (!groupRef.current) return;
    gsap.to(currentX, {
      current: targetX,
      duration: 1.2,
      ease: 'power3.inOut',
      onUpdate: () => {
        if (groupRef.current) {
          groupRef.current.position.x = currentX.current;
        }
      },
    });
  }, [targetX]);

  return <group ref={groupRef}>{children}</group>;
}

// ─── Tier 1: KVI-3 Capacitor Matrix (0–200mm) ────────────────────
// ENERGY SOURCE: Receives DC from drone battery, stores, and PULSES
function Tier1Capacitors() {
  const matRef = useRef<THREE.MeshStandardMaterial>(null);
  const time = useRef(0);

  useFrame((_, delta) => {
    time.current += delta;
    if (matRef.current) {
      // Charging pulse indicator
      matRef.current.emissiveIntensity = 0.08 + 0.12 * Math.sin(time.current * 2.5);
    }
  });

  const capModules = useMemo(() => {
    const modules: { x: number; y: number; z: number; scale: number }[] = [];
    const rings = [
      { radius: 0.22, count: 3, scale: 1.0 },
      { radius: 0.42, count: 3, scale: 0.95 },
    ];
    rings.forEach(({ radius, count, scale }) => {
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        modules.push({
          x: 0.8 + (rings.indexOf({ radius, count, scale }) * 0.35),
          y: Math.sin(angle) * radius,
          z: Math.cos(angle) * radius,
          scale,
        });
      }
    });
    return modules;
  }, []);

  return (
    <group>
      {/* PCB substrate (FR-4) */}
      <mesh position={[1.0, 0, 0]}>
        <boxGeometry args={[1.9, 0.018, 1.0]} />
        <meshStandardMaterial color="#0d1b2a" metalness={0.08} roughness={0.85} />
      </mesh>

      {/* Ground plane */}
      <mesh position={[1.0, -0.01, 0]}>
        <boxGeometry args={[1.85, 0.003, 0.95]} />
        <meshStandardMaterial color="#b87333" metalness={0.92} roughness={0.08} />
      </mesh>

      {/* Input power traces from drone battery (teal) */}
      {[0.3, 0.0, -0.3].map((z, i) => (
        <mesh key={`input-${i}`} position={[1.0, 0.012, z]}>
          <boxGeometry args={[1.8, 0.004, 0.035]} />
          <meshStandardMaterial
            color="#0d9488"
            metalness={0.95}
            roughness={0.05}
            emissive="#0d9488"
            emissiveIntensity={0.25}
          />
        </mesh>
      ))}

      {/* KVI-3 Capacitor modules */}
      {capModules.map(({ x, y, z, scale }, idx) => (
        <group key={`cap-${idx}`} position={[x, y, z]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.052 * scale, 0.052 * scale, 1.35 * scale, 16]} />
            <meshStandardMaterial
              ref={idx === 0 ? matRef : undefined}
              color="#a1a5aa"
              metalness={0.65}
              roughness={0.25}
              emissive="#0d9488"
              emissiveIntensity={0.08}
            />
          </mesh>
          <mesh position={[0.7 * scale, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.055 * scale, 0.055 * scale, 0.04, 12]} />
            <meshStandardMaterial color="#d4af37" metalness={0.98} roughness={0.04} />
          </mesh>
          <mesh position={[-0.7 * scale, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.055 * scale, 0.055 * scale, 0.04, 12]} />
            <meshStandardMaterial color="#d4af37" metalness={0.98} roughness={0.04} />
          </mesh>
          <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.054 * scale, 0.054 * scale, 0.12, 16]} />
            <meshStandardMaterial color="#1a1a1a" metalness={0.1} roughness={0.9} />
          </mesh>
        </group>
      ))}

      {/* Tier label */}
      <Html position={[1.0, 0.95, 0]} center style={{ pointerEvents: 'none' }}>
        <div style={{
          fontFamily: 'JetBrains Mono', fontSize: '9px', color: '#0d9488',
          background: 'rgba(0,0,0,0.85)', padding: '3px 8px',
          border: '1px solid #0d9488', borderRadius: '2px',
          whiteSpace: 'nowrap', letterSpacing: '0.08em',
          boxShadow: '0 0 8px rgba(13,148,136,0.3)',
        }}>
          TIER 1 · KVI-3 PULSE SOURCE · 0–200mm
        </div>
      </Html>
    </group>
  );
}

// ─── Tier 2: Copper EMI Shield / Faraday Bulkhead (200–205mm) ──────
// PROTECTION: Blocks EM backscatter, protects drone avionics
function Tier2EMIShield() {
  return (
    <group>
      {/* Main EMI shield disk (polished copper) */}
      <mesh position={[2.025, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.78, 0.78, 0.05, 96]} />
        <meshStandardMaterial color="#b87333" metalness={0.98} roughness={0.04} envMapIntensity={2.8} />
      </mesh>

      {/* Outer reinforcement ring */}
      <mesh position={[2.025, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.72, 0.025, 20, 96]} />
        <meshStandardMaterial color="#c8843a" metalness={0.96} roughness={0.06} />
      </mesh>

      {/* Inner ring (signal return) */}
      <mesh position={[2.025, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.35, 0.018, 16, 64]} />
        <meshStandardMaterial color="#b87333" metalness={0.97} roughness={0.05} />
      </mesh>

      {/* Center aperture (pulse pass-through) */}
      <mesh position={[2.025, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.12, 0.03, 16, 48]} />
        <meshStandardMaterial color="#a0743d" metalness={0.94} roughness={0.08} />
      </mesh>

      {/* Radial spokes (8, structural + EM isolation) */}
      {Array.from({ length: 8 }, (_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        return (
          <mesh key={`spoke-${i}`} position={[2.025, Math.sin(angle) * 0.41, Math.cos(angle) * 0.41]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.01, 0.01, 0.62, 8]} />
            <meshStandardMaterial color="#d4843a" metalness={0.95} roughness={0.08} />
          </mesh>
        );
      })}

      {/* Mounting posts (3) */}
      {[0, 120, 240].map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        return (
          <mesh key={`post-${i}`} position={[2.025, Math.sin(rad) * 0.58, Math.cos(rad) * 0.58]}>
            <cylinderGeometry args={[0.015, 0.015, 0.08, 12]} />
            <meshStandardMaterial color="#8b6914" metalness={0.85} roughness={0.15} />
          </mesh>
        );
      })}

      {/* Tier label */}
      <Html position={[2.025, 1.0, 0]} center style={{ pointerEvents: 'none' }}>
        <div style={{
          fontFamily: 'JetBrains Mono', fontSize: '9px', color: '#b87333',
          background: 'rgba(0,0,0,0.85)', padding: '3px 8px',
          border: '1px solid #b87333', borderRadius: '2px',
          whiteSpace: 'nowrap', letterSpacing: '0.08em',
          boxShadow: '0 0 8px rgba(184,115,51,0.3)',
        }}>
          TIER 2 · EMI SHIELD · 200–205mm
        </div>
      </Html>
    </group>
  );
}

// ─── Tier 3: GaN Amplifiers + Cooling Fins (205–350mm) ────────────
// RF GENERATION & AMPLIFICATION: Converts pulse to RF, amplifies, dissipates heat
function Tier3GaN() {
  const heatRef = useRef<THREE.MeshStandardMaterial>(null);
  const time = useRef(0);

  useFrame((_, delta) => {
    time.current += delta;
    if (heatRef.current) {
      // Heat generation during RF amplification
      heatRef.current.emissiveIntensity = 0.06 + 0.14 * Math.abs(Math.sin(time.current * 1.8));
    }
  });

  const ganModules = useMemo(() =>
    Array.from({ length: 6 }, (_, i) => {
      const angle = (i / 6) * Math.PI * 2;
      return { y: Math.sin(angle) * 0.48, z: Math.cos(angle) * 0.48, key: `gan-${i}` };
    }), []);

  const fins = useMemo(() =>
    Array.from({ length: 16 }, (_, i) => ({ angle: (i / 16) * Math.PI * 2, key: `fin-${i}` })), []);

  return (
    <group>
      {/* Central waveguide (RF feed from Tier 1 pulse) */}
      <mesh position={[2.775, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.18, 0.18, 1.45, 48]} />
        <meshStandardMaterial color="#8b8b8b" metalness={0.72} roughness={0.22} />
      </mesh>

      {/* Waveguide interior (RAM black) */}
      <mesh position={[2.775, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.17, 0.17, 1.44, 48]} />
        <meshStandardMaterial color="#0a0a0a" metalness={0.05} roughness={0.95} />
      </mesh>

      {/* GaN power modules (6, mounted radially) */}
      {ganModules.map(({ y, z, key }, idx) => (
        <group key={key} position={[2.775, y, z]}>
          <mesh>
            <boxGeometry args={[0.92, 0.125, 0.125]} />
            <meshStandardMaterial
              ref={idx === 0 ? heatRef : undefined}
              color="#2d2d2d"
              metalness={0.45}
              roughness={0.55}
              emissive="#ff4500"
              emissiveIntensity={0.06}
            />
          </mesh>
          <mesh position={[0.48, 0, 0]}>
            <boxGeometry args={[0.08, 0.125, 0.125]} />
            <meshStandardMaterial color="#d4af37" metalness={0.96} roughness={0.06} />
          </mesh>
          <mesh position={[-0.48, 0, 0]}>
            <boxGeometry args={[0.08, 0.125, 0.125]} />
            <meshStandardMaterial color="#d4af37" metalness={0.96} roughness={0.06} />
          </mesh>
        </group>
      ))}

      {/* Brushed aluminum cooling fins (16, radial) */}
      {fins.map(({ angle, key }) => (
        <mesh key={key} position={[2.775, Math.sin(angle) * 0.65, Math.cos(angle) * 0.65]} rotation={[angle, 0, Math.PI / 2]}>
          <boxGeometry args={[1.45, 0.008, 0.22]} />
          <meshStandardMaterial color="#a8a8a8" metalness={0.68} roughness={0.32} />
        </mesh>
      ))}

      {/* Thermal air-flow channels (visible ducts) */}
      {[0, 90, 180, 270].map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        return (
          <mesh key={`channel-${i}`} position={[2.775, Math.sin(rad) * 0.68, Math.cos(rad) * 0.68]}>
            <boxGeometry args={[1.4, 0.006, 0.08]} />
            <meshStandardMaterial color="#4a4a4a" metalness={0.4} roughness={0.6} />
          </mesh>
        );
      })}

      {/* Fin connector rings (3) */}
      {[-0.45, 0, 0.45].map((dx, i) => (
        <mesh key={`ring-${i}`} position={[2.775 + dx, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.65, 0.02, 16, 96]} />
          <meshStandardMaterial color="#6b7280" metalness={0.82} roughness={0.18} />
        </mesh>
      ))}

      {/* Tier label */}
      <Html position={[2.775, 1.0, 0]} center style={{ pointerEvents: 'none' }}>
        <div style={{
          fontFamily: 'JetBrains Mono', fontSize: '9px', color: '#ff6b35',
          background: 'rgba(0,0,0,0.85)', padding: '3px 8px',
          border: '1px solid #ff6b35', borderRadius: '2px',
          whiteSpace: 'nowrap', letterSpacing: '0.08em',
          boxShadow: '0 0 8px rgba(255,107,53,0.3)',
        }}>
          TIER 3 · GaN RF AMP · 205–350mm
        </div>
      </Html>
    </group>
  );
}

// ─── Tier 4: Conformal Gold Phased Array (350–500mm) ──────────────
// EMISSION & BEAM STEERING: Receives RF from Tier 3, emits focused HPM beam
function Tier4PhasedArray() {
  const traceRef = useRef<THREE.MeshStandardMaterial>(null);
  const time = useRef(0);

  useFrame((_, delta) => {
    time.current += delta;
    if (traceRef.current) {
      // RF emission pulse
      traceRef.current.emissiveIntensity = 0.32 + 0.28 * Math.sin(time.current * 2.8);
    }
  });

  const patches = useMemo(() => {
    const items: { x: number; y: number; z: number; scale: number }[] = [];
    const rings = 8;
    for (let ring = 0; ring < rings; ring++) {
      const t = ring / (rings - 1);
      const xPos = 3.5 + t * 1.5;
      const coneR = 0.78 * (1 - t * 0.95);
      const count = Math.max(4, Math.round(12 * (1 - t * 0.6)));
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        items.push({
          x: xPos,
          y: Math.sin(angle) * coneR * 0.85,
          z: Math.cos(angle) * coneR * 0.85,
          scale: 0.068 * (1 - t * 0.5),
        });
      }
    }
    return items;
  }, []);

  return (
    <group>
      {/* RAM black lining */}
      <mesh position={[4.25, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <coneGeometry args={[0.76, 1.5, 48, 1, true]} />
        <meshStandardMaterial color="#050505" metalness={0.02} roughness={0.98} side={THREE.BackSide} />
      </mesh>

      {/* Gold antenna patches (64, hemispherical AESA) */}
      {patches.map(({ x, y, z, scale }, idx) => (
        <mesh key={`patch-${idx}`} position={[x, y, z]}>
          <boxGeometry args={[scale, scale, scale * 0.22]} />
          <meshStandardMaterial
            ref={idx === 0 ? traceRef : undefined}
            color="#d97706"
            metalness={0.97}
            roughness={0.03}
            emissive="#f59e0b"
            emissiveIntensity={0.32}
          />
        </mesh>
      ))}

      {/* Gold feed network (6 primary RF feeds from Tier 3) */}
      {Array.from({ length: 6 }, (_, i) => {
        const angle = (i / 6) * Math.PI * 2;
        return (
          <mesh key={`feed-${i}`} position={[4.25, Math.sin(angle) * 0.3, Math.cos(angle) * 0.3]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.008, 0.008, 1.5, 12]} />
            <meshStandardMaterial
              color="#f59e0b"
              metalness={0.99}
              roughness={0.01}
              emissive="#f59e0b"
              emissiveIntensity={0.42}
            />
          </mesh>
        );
      })}

      {/* Phasing network (secondary traces) */}
      {Array.from({ length: 12 }, (_, i) => {
        const angle = (i / 12) * Math.PI * 2;
        return (
          <mesh key={`phase-${i}`} position={[4.25, Math.sin(angle) * 0.18, Math.cos(angle) * 0.18]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.005, 0.005, 1.5, 8]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.97} roughness={0.04} emissive="#fbbf24" emissiveIntensity={0.25} />
          </mesh>
        );
      })}

      {/* Tier label */}
      <Html position={[4.25, 0.7, 0]} center style={{ pointerEvents: 'none' }}>
        <div style={{
          fontFamily: 'JetBrains Mono', fontSize: '9px', color: '#f59e0b',
          background: 'rgba(0,0,0,0.85)', padding: '3px 8px',
          border: '1px solid #f59e0b', borderRadius: '2px',
          whiteSpace: 'nowrap', letterSpacing: '0.08em',
          boxShadow: '0 0 8px rgba(245,158,11,0.3)',
        }}>
          TIER 4 · PHASED ARRAY · 350–500mm
        </div>
      </Html>
    </group>
  );
}

// ─── Ogive Radome Shell ───────────────────────────────────────────
function RadomeShell({ opacity }: { opacity: number }) {
  const matRef = useRef<THREE.MeshPhysicalMaterial>(null);

  useEffect(() => {
    if (!matRef.current) return;
    gsap.to(matRef.current, { opacity, duration: 0.8, ease: 'power2.inOut' });
  }, [opacity]);

  const geo = useMemo(() => createPreciseOgiveGeometry(5, 1.25, 128), []);

  return (
    <mesh geometry={geo} renderOrder={opacity < 0.99 ? 1 : 0}>
      <meshPhysicalMaterial
        ref={matRef}
        color="#7a9ab5"
        metalness={0.08}
        roughness={0.35}
        opacity={opacity}
        transparent={true}
        side={THREE.FrontSide}
        envMapIntensity={1.2}
        depthWrite={opacity > 0.6}
      />
    </mesh>
  );
}

// ─── HPM Beam (Emitted from Tier 4 Antenna Apex) ─────────────────
// CRITICAL FIX: Beam originates from the phased array tip (Tier 4 apex)
function HPMBeam({ active }: { active: boolean }) {
  const beamRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const outerRef = useRef<THREE.Mesh>(null);
  const time = useRef(0);
  const wasActive = useRef(false);

  useEffect(() => {
    if (!beamRef.current) return;
    if (active && !wasActive.current) {
      wasActive.current = true;
      time.current = 0;
      if (coreRef.current) {
        coreRef.current.scale.x = 0;
        coreRef.current.visible = true;
        gsap.to(coreRef.current.scale, { x: 1, duration: 0.8, ease: 'power2.out' });
      }
      if (glowRef.current) {
        glowRef.current.scale.x = 0;
        glowRef.current.visible = true;
        gsap.to(glowRef.current.scale, { x: 1, duration: 0.9, ease: 'power2.out' });
      }
      if (outerRef.current) {
        outerRef.current.scale.x = 0;
        outerRef.current.visible = true;
        gsap.to(outerRef.current.scale, { x: 1, duration: 1.0, ease: 'power2.out' });
      }
    } else if (!active && wasActive.current) {
      wasActive.current = false;
      [coreRef, glowRef, outerRef].forEach((ref) => {
        if (ref.current) {
          gsap.to(ref.current.scale, {
            x: 0, duration: 0.4, ease: 'power2.in',
            onComplete: () => { if (ref.current) ref.current.visible = false; },
          });
        }
      });
    }
  }, [active]);

  useFrame((_, delta) => {
    time.current += delta;
    if (active && coreRef.current) {
      const mat = coreRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.75 + 0.25 * Math.sin(time.current * 14);
    }
  });

  return (
    // Beam originates at Tier 4 apex (X=5.0) and travels forward
    <group ref={beamRef} position={[5.0, 0, 0]}>
      {/* Outer beam envelope (low opacity blue) */}
      <mesh ref={outerRef} position={[4.5, 0, 0]} rotation={[0, 0, Math.PI / 2]} visible={false}>
        <cylinderGeometry args={[0.28, 0.28, 9, 20]} />
        <meshBasicMaterial color="#1d4ed8" transparent opacity={0.06} side={THREE.BackSide} />
      </mesh>
      {/* Middle glow layer */}
      <mesh ref={glowRef} position={[4.5, 0, 0]} rotation={[0, 0, Math.PI / 2]} visible={false}>
        <cylinderGeometry args={[0.13, 0.13, 9, 18]} />
        <meshBasicMaterial color="#3b82f6" transparent opacity={0.25} side={THREE.BackSide} />
      </mesh>
      {/* Core beam (bright blue, highly visible) */}
      <mesh ref={coreRef} position={[4.5, 0, 0]} rotation={[0, 0, Math.PI / 2]} visible={false}>
        <cylinderGeometry args={[0.028, 0.028, 9, 16]} />
        <meshBasicMaterial color="#93c5fd" transparent opacity={0.95} />
      </mesh>
      {/* Beam origin glow at antenna tip */}
      {active && (
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.16, 20, 20]} />
          <meshBasicMaterial color="#60a5fa" transparent opacity={0.75} />
        </mesh>
      )}
    </group>
  );
}

// ─── Shahed Drone Target ──────────────────────────────────────────
function ShahedDrone({ visible, hit }: { visible: boolean; hit: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const time = useRef(0);

  useFrame((_, delta) => {
    time.current += delta;
    if (!groupRef.current) return;
    if (hit) {
      groupRef.current.rotation.x += delta * 4;
      groupRef.current.rotation.z += delta * 2.5;
      groupRef.current.position.y -= delta * 0.8;
      groupRef.current.position.x -= delta * 0.3;
    } else {
      const approach = time.current * 0.25;
      groupRef.current.position.x = 14 - approach;
      groupRef.current.position.y = 1.5 + Math.sin(time.current * 0.9) * 0.15;
      groupRef.current.position.z = Math.sin(time.current * 0.4) * 0.3;
    }
  });

  if (!visible) return null;

  return (
    <group ref={groupRef} position={[14, 1.5, 0]}>
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.07, 0.055, 0.75, 16]} />
        <meshStandardMaterial
          color={hit ? '#7f1d1d' : '#4b5563'}
          metalness={0.4}
          roughness={0.6}
          emissive={hit ? '#ef4444' : '#000000'}
          emissiveIntensity={hit ? 0.4 : 0}
        />
      </mesh>
      <mesh position={[0.42, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <coneGeometry args={[0.055, 0.15, 12]} />
        <meshStandardMaterial color={hit ? '#7f1d1d' : '#374151'} metalness={0.3} roughness={0.7} />
      </mesh>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.45, 0.015, 0.85]} />
        <meshStandardMaterial color={hit ? '#7f1d1d' : '#374151'} metalness={0.25} roughness={0.75} />
      </mesh>
      <mesh position={[-0.32, 0.1, 0]}>
        <boxGeometry args={[0.18, 0.14, 0.015]} />
        <meshStandardMaterial color={hit ? '#7f1d1d' : '#1f2937'} />
      </mesh>
      <mesh position={[-0.32, 0, 0.1]}>
        <boxGeometry args={[0.18, 0.015, 0.14]} />
        <meshStandardMaterial color={hit ? '#7f1d1d' : '#1f2937'} />
      </mesh>
      <mesh position={[-0.4, 0, 0]}>
        <sphereGeometry args={[0.035, 12, 12]} />
        <meshBasicMaterial color={hit ? '#ff2200' : '#ff6600'} />
      </mesh>
      {!hit && (
        <Html position={[0, 0.38, 0]} center style={{ pointerEvents: 'none' }}>
          <div style={{
            fontFamily: 'JetBrains Mono', fontSize: '8px', color: '#ef4444',
            border: '1px solid #ef4444', padding: '2px 6px', borderRadius: '2px',
            background: 'rgba(0,0,0,0.7)', whiteSpace: 'nowrap',
            boxShadow: '0 0 8px rgba(239,68,68,0.4)',
          }}>
            ◎ SHAHED-136 · LOCKED
          </div>
        </Html>
      )}
      {hit && (
        <Html position={[0, 0.5, 0]} center style={{ pointerEvents: 'none' }}>
          <div style={{
            fontFamily: 'JetBrains Mono', fontSize: '9px', color: '#f59e0b',
            border: '1px solid #f59e0b', padding: '3px 8px', borderRadius: '2px',
            background: 'rgba(0,0,0,0.8)', whiteSpace: 'nowrap',
            boxShadow: '0 0 12px rgba(245,158,11,0.5)',
          }}>
            ✓ NEUTRALIZED
          </div>
        </Html>
      )}
    </group>
  );
}

// ─── Presentation Mode Annotations ───────────────────────────────
const TIER_ANNOTATIONS = [
  {
    x: 1.0, y: 1.35,
    label: 'Tier 1',
    arabicDesc: 'مصدر الطاقة النبضية',
    enDesc: 'KVI-3 Pulse Source\nCharges from drone battery, pulses on command',
    color: '#0d9488',
  },
  {
    x: 2.025, y: 1.45,
    label: 'Tier 2',
    arabicDesc: 'درع فاراداي',
    enDesc: 'Copper EMI Shield\nProtects drone avionics from backscatter',
    color: '#b87333',
  },
  {
    x: 2.775, y: 1.45,
    label: 'Tier 3',
    arabicDesc: 'مضخم RF وتبريد',
    enDesc: 'GaN RF Amplifier\nConverts pulse to RF, amplifies signal',
    color: '#ff6b35',
  },
  {
    x: 4.25, y: 1.1,
    label: 'Tier 4',
    arabicDesc: 'هوائي الانبعاث',
    enDesc: 'Phased Array Antenna\nEmits focused HPM beam toward target',
    color: '#f59e0b',
  },
];

// ─── Camera Controller ────────────────────────────────────────────
function CameraController({ mode }: { mode: SceneMode }) {
  const { camera } = useThree();
  const time = useRef(0);
  const prevMode = useRef<SceneMode>('normal');

  useEffect(() => {
    if (prevMode.current === mode) return;
    prevMode.current = mode;
    time.current = 0;

    if (mode === 'normal') {
      gsap.to(camera.position, { x: 2.5, y: 2.5, z: 7, duration: 1.4, ease: 'power2.inOut' });
    } else if (mode === 'exploded') {
      gsap.to(camera.position, { x: 2.5, y: 3.5, z: 9, duration: 1.4, ease: 'power2.inOut' });
    } else if (mode === 'attack') {
      gsap.to(camera.position, { x: 6, y: 1.5, z: 6, duration: 1.5, ease: 'power2.inOut' });
    } else if (mode === 'presentation') {
      gsap.to(camera.position, { x: 2.5, y: 3, z: 8, duration: 1.2, ease: 'power2.inOut' });
    }
  }, [mode, camera]);

  useFrame((_, delta) => {
    if (mode === 'presentation') {
      time.current += delta * 0.35;
      camera.position.x = 2.5 + Math.sin(time.current) * 7.5;
      camera.position.z = Math.cos(time.current) * 7.5;
      camera.position.y = 2.5 + Math.sin(time.current * 0.5) * 1.8;
      camera.lookAt(2.5, 0, 0);
    }
  });

  return null;
}

// ─── Main Scene Content ───────────────────────────────────────────
function SceneContent({ mode, radomeOpacity, showAnnotations }: SceneProps) {
  const explodeOffsets = mode === 'exploded'
    ? { t1: -3.2, t2: -1.6, t3: 1.6, t4: 3.2 }
    : { t1: 0, t2: 0, t3: 0, t4: 0 };

  const attackActive = mode === 'attack';
  const [droneHit, setDroneHit] = useState(false);

  useEffect(() => {
    if (mode === 'attack') {
      setDroneHit(false);
      const t = setTimeout(() => setDroneHit(true), 3500);
      return () => clearTimeout(t);
    } else {
      setDroneHit(false);
    }
  }, [mode]);

  return (
    <>
      {/* Lighting - Enhanced for material contrast */}
      <ambientLight intensity={0.32} />
      <directionalLight position={[12, 8, 6]} intensity={1.8} color="#ffffff" castShadow shadow-mapSize={[2048, 2048]} />
      <directionalLight position={[-8, 5, -5]} intensity={1.0} color="#b0d4ff" />
      <pointLight position={[3.5, 5, 5]} intensity={1.4} color="#3b82f6" distance={14} />
      <pointLight position={[2.5, -4, -4]} intensity={0.8} color="#f59e0b" distance={12} />
      <spotLight position={[1, 8, 3]} angle={0.4} penumbra={0.7} intensity={1.2} color="#ffffff" target-position={[2.5, 0, 0]} />

      {/* Studio environment */}
      <Environment preset="studio" />

      {/* Contact shadow */}
      <ContactShadows
        position={[2.5, -1.6, 0]}
        opacity={0.5}
        scale={14}
        blur={2.8}
        far={3.5}
        color="#000820"
      />

      {/* Camera controller */}
      <CameraController mode={mode} />

      {/* Orbit controls */}
      <OrbitControls
        enabled={mode !== 'presentation'}
        target={[2.5, 0, 0]}
        minDistance={3}
        maxDistance={16}
        enablePan={false}
        autoRotate={mode === 'normal'}
        autoRotateSpeed={0.6}
      />

      {/* Radome shell */}
      <RadomeShell opacity={radomeOpacity} />

      {/* Tier 1: KVI-3 Pulse Source */}
      <AnimatedGroup targetX={explodeOffsets.t1}>
        <Tier1Capacitors />
      </AnimatedGroup>

      {/* Tier 2: EMI Shield */}
      <AnimatedGroup targetX={explodeOffsets.t2}>
        <Tier2EMIShield />
      </AnimatedGroup>

      {/* Tier 3: GaN RF Amplifier */}
      <AnimatedGroup targetX={explodeOffsets.t3}>
        <Tier3GaN />
      </AnimatedGroup>

      {/* Tier 4: Phased Array Antenna */}
      <AnimatedGroup targetX={explodeOffsets.t4}>
        <Tier4PhasedArray />
      </AnimatedGroup>

      {/* Primary Interconnects Layer */}
      <InterconnectsLayer />

      {/* HPM Beam (emitted from Tier 4) */}
      <HPMBeam active={attackActive} />

      {/* Shahed drone target */}
      <ShahedDrone visible={mode === 'attack'} hit={droneHit} />

      {/* Annotations */}
      {showAnnotations && TIER_ANNOTATIONS.map((ann) => (
        <Html key={ann.label} position={[ann.x, ann.y, 0]} center style={{ pointerEvents: 'none' }}>
          <div style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: '9px',
            color: ann.color,
            background: 'rgba(0,0,0,0.88)',
            padding: '6px 10px',
            border: `1px solid ${ann.color}`,
            borderRadius: '2px',
            whiteSpace: 'pre',
            lineHeight: 1.7,
            textAlign: 'center',
            boxShadow: `0 0 14px ${ann.color}44`,
            minWidth: '160px',
          }}>
            <div style={{ fontSize: '10px', fontWeight: 700, marginBottom: '3px', letterSpacing: '0.08em' }}>{ann.label}</div>
            <div style={{ fontFamily: 'IBM Plex Sans Arabic', fontSize: '9px', marginBottom: '2px', direction: 'rtl' }}>{ann.arabicDesc}</div>
            <div style={{ opacity: 0.75, fontSize: '8px' }}>{ann.enDesc}</div>
          </div>
        </Html>
      ))}

      {/* Grid floor */}
      <gridHelper args={[22, 22, '#0f2040', '#070f20']} position={[2.5, -1.6, 0]} />
    </>
  );
}

// ─── Exported Canvas Wrapper ──────────────────────────────────────
export default function MothdroneScene({ mode, radomeOpacity, showAnnotations, onModeChange }: SceneProps) {
  return (
    <Canvas
      camera={{ position: [2.5, 2.5, 7], fov: 45 }}
      shadows
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.15,
      }}
      style={{ background: 'transparent' }}
    >
      <SceneContent
        mode={mode}
        radomeOpacity={radomeOpacity}
        showAnnotations={showAnnotations}
        onModeChange={onModeChange}
      />
    </Canvas>
  );
}
