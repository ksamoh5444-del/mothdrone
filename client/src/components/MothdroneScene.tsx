/**
 * MothdroneScene.tsx
 * ─────────────────────────────────────────────────────────────────
 * DESIGN: Tactical Precision / Defense-Grade HMI
 * 3D Engine: React Three Fiber + Three.js + GSAP
 *
 * CRITICAL ALIGNMENT RULE:
 *   - The ogive nose cone points along the +X axis (horizontal / longitudinal)
 *   - Base is at X=0, tip is at X=5 (scale: 1 unit = 100mm)
 *   - All 4 tiers are positioned along the X axis — NO vertical stacking
 *
 * TIER LAYOUT (X-axis, 1 unit = 100mm):
 *   Tier 1: X 0.0 → 2.0  (0–200mm)  KVI-3 Capacitor Matrix
 *   Tier 2: X 2.0 → 2.05 (200–205mm) Copper EMI Shield (disk)
 *   Tier 3: X 2.05 → 3.5 (205–350mm) GaN Amplifiers + fins
 *   Tier 4: X 3.5 → 5.0  (350–500mm) Conformal Gold Phased Array
 */

import { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Html } from '@react-three/drei';
import * as THREE from 'three';
import { gsap } from 'gsap';

// ─── Types ────────────────────────────────────────────────────────
export type SceneMode = 'normal' | 'exploded' | 'attack' | 'presentation';

interface SceneProps {
  mode: SceneMode;
  radomeOpacity: number;
  showAnnotations: boolean;
  onModeChange?: (mode: SceneMode) => void;
}

// ─── Ogive Nose Cone Geometry ─────────────────────────────────────
// Creates a tangent ogive profile pointing along +X axis
function createOgiveGeometry(length: number, baseRadius: number, segments = 80): THREE.BufferGeometry {
  const profilePoints: THREE.Vector2[] = [];
  const rho = (baseRadius * baseRadius + length * length) / (2 * baseRadius);

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const x = t * length;
    // Tangent ogive formula
    const r = Math.sqrt(Math.max(0, rho * rho - (length - x) * (length - x))) - (rho - baseRadius);
    profilePoints.push(new THREE.Vector2(Math.max(0, r), x));
  }

  const geo = new THREE.LatheGeometry(profilePoints, 72);
  // Rotate so cone points along +X (LatheGeometry creates along +Y)
  geo.applyMatrix4(new THREE.Matrix4().makeRotationZ(-Math.PI / 2));
  return geo;
}

// ─── Animated group with GSAP-driven X offset ────────────────────
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

// ─── KVI-3 Capacitor Matrix (Tier 1: 0–2.0 units) ────────────────
function Tier1Capacitors() {
  const matRef = useRef<THREE.MeshStandardMaterial>(null);
  const time = useRef(0);

  useFrame((_, delta) => {
    time.current += delta;
    if (matRef.current) {
      matRef.current.emissiveIntensity = 0.12 + 0.08 * Math.sin(time.current * 2.5);
    }
  });

  const caps = useMemo(() => {
    const items: { x: number; y: number; z: number; key: string }[] = [];
    const rings = [
      { radius: 0.18, count: 6 },
      { radius: 0.38, count: 10 },
      { radius: 0.58, count: 14 },
    ];
    rings.forEach(({ radius, count }, ri) => {
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        const xJitter = (ri % 2) * 0.05;
        items.push({
          x: 0.25 + xJitter,
          y: Math.sin(angle) * radius,
          z: Math.cos(angle) * radius,
          key: `cap-${ri}-${i}`,
        });
      }
    });
    return items;
  }, []);

  return (
    <group>
      {/* Capacitor cylinders */}
      {caps.map(({ x, y, z, key }, idx) => (
        <mesh key={key} position={[x + 0.8, y, z]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.045, 0.045, 1.4, 10]} />
          <meshStandardMaterial
            ref={idx === 0 ? matRef : undefined}
            color="#0f766e"
            metalness={0.25}
            roughness={0.45}
            emissive="#0d9488"
            emissiveIntensity={0.12}
          />
        </mesh>
      ))}
      {/* Gold terminal caps */}
      {caps.map(({ x, y, z, key }) => (
        <group key={`term-${key}`}>
          <mesh position={[x + 0.8 + 0.72, y, z]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.048, 0.048, 0.035, 10]} />
            <meshStandardMaterial color="#b45309" metalness={0.95} roughness={0.08} />
          </mesh>
          <mesh position={[x + 0.8 - 0.72, y, z]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.048, 0.048, 0.035, 10]} />
            <meshStandardMaterial color="#b45309" metalness={0.95} roughness={0.08} />
          </mesh>
        </group>
      ))}
      {/* PCB substrate */}
      <mesh position={[1.0, 0, 0]}>
        <boxGeometry args={[1.9, 0.015, 1.1]} />
        <meshStandardMaterial color="#0f2d1a" metalness={0.15} roughness={0.75} />
      </mesh>
      {/* PCB traces */}
      {[0.15, 0.35, 0.55, 0.75, 0.95].map((z, i) => (
        <mesh key={`trace-${i}`} position={[1.0, 0.01, z - 0.55]}>
          <boxGeometry args={[1.7, 0.003, 0.007]} />
          <meshStandardMaterial color="#b45309" metalness={0.98} roughness={0.04} emissive="#b45309" emissiveIntensity={0.25} />
        </mesh>
      ))}
      {/* Tier label */}
      <Html position={[1.0, 0.95, 0]} center style={{ pointerEvents: 'none' }}>
        <div style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', color: '#0d9488', background: 'rgba(0,0,0,0.8)', padding: '2px 7px', border: '1px solid #0d9488', whiteSpace: 'nowrap', borderRadius: '2px', letterSpacing: '0.06em' }}>
          TIER 1 · KVI-3 CAPS · 0–200mm
        </div>
      </Html>
    </group>
  );
}

// ─── EMI Copper Shield (Tier 2: 2.0–2.05 units) ──────────────────
function Tier2EMIShield() {
  return (
    <group>
      {/* Main copper disk */}
      <mesh position={[2.025, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.78, 0.78, 0.05, 72]} />
        <meshStandardMaterial color="#b87333" metalness={0.97} roughness={0.06} envMapIntensity={3} />
      </mesh>
      {/* Outer reinforcement ring */}
      <mesh position={[2.025, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.72, 0.022, 16, 72]} />
        <meshStandardMaterial color="#d4843a" metalness={0.99} roughness={0.04} />
      </mesh>
      {/* Inner ring */}
      <mesh position={[2.025, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.35, 0.015, 12, 48]} />
        <meshStandardMaterial color="#b87333" metalness={0.97} roughness={0.06} />
      </mesh>
      {/* Center aperture */}
      <mesh position={[2.025, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.1, 0.025, 12, 32]} />
        <meshStandardMaterial color="#b87333" metalness={0.95} roughness={0.1} />
      </mesh>
      {/* Radial spokes */}
      {Array.from({ length: 8 }, (_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        return (
          <mesh key={`spoke-${i}`} position={[2.025, Math.sin(angle) * 0.41, Math.cos(angle) * 0.41]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.008, 0.008, 0.62, 6]} />
            <meshStandardMaterial color="#c8843a" metalness={0.96} roughness={0.07} />
          </mesh>
        );
      })}
      {/* Tier label */}
      <Html position={[2.025, 1.0, 0]} center style={{ pointerEvents: 'none' }}>
        <div style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', color: '#b87333', background: 'rgba(0,0,0,0.8)', padding: '2px 7px', border: '1px solid #b87333', whiteSpace: 'nowrap', borderRadius: '2px', letterSpacing: '0.06em' }}>
          TIER 2 · EMI SHIELD · 200–205mm
        </div>
      </Html>
    </group>
  );
}

// ─── GaN Amplifiers + Cooling Fins (Tier 3: 2.05–3.5 units) ──────
function Tier3GaN() {
  const heatRef = useRef<THREE.MeshStandardMaterial>(null);
  const time = useRef(0);

  useFrame((_, delta) => {
    time.current += delta;
    if (heatRef.current) {
      heatRef.current.emissiveIntensity = 0.08 + 0.1 * Math.abs(Math.sin(time.current * 1.8));
    }
  });

  const fins = useMemo(() =>
    Array.from({ length: 14 }, (_, i) => ({ angle: (i / 14) * Math.PI * 2, key: `fin-${i}` })), []);

  const ganModules = useMemo(() =>
    Array.from({ length: 6 }, (_, i) => {
      const angle = (i / 6) * Math.PI * 2;
      return { y: Math.sin(angle) * 0.45, z: Math.cos(angle) * 0.45, key: `gan-${i}` };
    }), []);

  return (
    <group>
      {/* Horizontal cooling fins (radial) */}
      {fins.map(({ angle, key }) => (
        <mesh key={key} position={[2.775, Math.sin(angle) * 0.62, Math.cos(angle) * 0.62]} rotation={[angle, 0, Math.PI / 2]}>
          <boxGeometry args={[1.4, 0.007, 0.2]} />
          <meshStandardMaterial color="#9ca3af" metalness={0.72} roughness={0.28} />
        </mesh>
      ))}
      {/* GaN power modules */}
      {ganModules.map(({ y, z, key }, idx) => (
        <mesh key={key} position={[2.775, y, z]}>
          <boxGeometry args={[0.95, 0.11, 0.11]} />
          <meshStandardMaterial
            ref={idx === 0 ? heatRef : undefined}
            color="#1f2937"
            metalness={0.55}
            roughness={0.5}
            emissive="#ff4500"
            emissiveIntensity={0.08}
          />
        </mesh>
      ))}
      {/* Central waveguide */}
      <mesh position={[2.775, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.16, 0.16, 1.45, 32]} />
        <meshStandardMaterial color="#374151" metalness={0.85} roughness={0.18} />
      </mesh>
      {/* Fin connector rings */}
      {[-0.5, 0, 0.5].map((dx, i) => (
        <mesh key={`ring-${i}`} position={[2.775 + dx, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <torusGeometry args={[0.62, 0.016, 12, 72]} />
          <meshStandardMaterial color="#6b7280" metalness={0.88} roughness={0.14} />
        </mesh>
      ))}
      {/* Tier label */}
      <Html position={[2.775, 1.0, 0]} center style={{ pointerEvents: 'none' }}>
        <div style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', color: '#ff6b35', background: 'rgba(0,0,0,0.8)', padding: '2px 7px', border: '1px solid #ff6b35', whiteSpace: 'nowrap', borderRadius: '2px', letterSpacing: '0.06em' }}>
          TIER 3 · GaN AMPS · 205–350mm
        </div>
      </Html>
    </group>
  );
}

// ─── Conformal Gold Phased Array (Tier 4: 3.5–5.0 units) ─────────
function Tier4PhasedArray() {
  const traceRef = useRef<THREE.MeshStandardMaterial>(null);
  const time = useRef(0);

  useFrame((_, delta) => {
    time.current += delta;
    if (traceRef.current) {
      traceRef.current.emissiveIntensity = 0.35 + 0.25 * Math.sin(time.current * 3.2);
    }
  });

  const patches = useMemo(() => {
    const items: { x: number; y: number; z: number; scale: number; key: string }[] = [];
    const rings = 6;
    for (let ring = 0; ring < rings; ring++) {
      const t = ring / (rings - 1);
      const xPos = 3.5 + t * 1.5;
      const coneR = 0.78 * (1 - t * 0.96);
      const count = Math.max(3, Math.round(10 * (1 - t * 0.65)));
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        items.push({
          x: xPos,
          y: Math.sin(angle) * coneR * 0.82,
          z: Math.cos(angle) * coneR * 0.82,
          scale: 0.065 * (1 - t * 0.45),
          key: `patch-${ring}-${i}`,
        });
      }
    }
    return items;
  }, []);

  return (
    <group>
      {/* RAM black lining */}
      <mesh position={[4.25, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <coneGeometry args={[0.74, 1.5, 36, 1, true]} />
        <meshStandardMaterial color="#080808" metalness={0.05} roughness={0.95} side={THREE.BackSide} />
      </mesh>
      {/* Gold antenna patches */}
      {patches.map(({ x, y, z, scale, key }, idx) => (
        <mesh key={key} position={[x, y, z]}>
          <boxGeometry args={[scale, scale, scale * 0.25]} />
          <meshStandardMaterial
            ref={idx === 0 ? traceRef : undefined}
            color="#d97706"
            metalness={0.97}
            roughness={0.04}
            emissive="#f59e0b"
            emissiveIntensity={0.35}
          />
        </mesh>
      ))}
      {/* Gold feed network */}
      {Array.from({ length: 6 }, (_, i) => {
        const angle = (i / 6) * Math.PI * 2;
        return (
          <mesh key={`feed-${i}`} position={[4.25, Math.sin(angle) * 0.28, Math.cos(angle) * 0.28]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.007, 0.007, 1.5, 8]} />
            <meshStandardMaterial color="#f59e0b" metalness={0.99} roughness={0.02} emissive="#f59e0b" emissiveIntensity={0.45} />
          </mesh>
        );
      })}
      {/* Tier label */}
      <Html position={[4.25, 0.65, 0]} center style={{ pointerEvents: 'none' }}>
        <div style={{ fontFamily: 'JetBrains Mono', fontSize: '9px', color: '#f59e0b', background: 'rgba(0,0,0,0.8)', padding: '2px 7px', border: '1px solid #f59e0b', whiteSpace: 'nowrap', borderRadius: '2px', letterSpacing: '0.06em' }}>
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

  const geo = useMemo(() => createOgiveGeometry(5, 1.25, 80), []);

  return (
    <mesh geometry={geo} renderOrder={opacity < 0.99 ? 1 : 0}>
      <meshPhysicalMaterial
        ref={matRef}
        color="#7a9ab5"
        metalness={0.12}
        roughness={0.3}
        opacity={opacity}
        transparent={true}
        side={THREE.FrontSide}
        envMapIntensity={1.5}
        depthWrite={opacity > 0.6}
      />
    </mesh>
  );
}

// ─── HPM Beam ─────────────────────────────────────────────────────
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
      // Animate beam extending
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
      mat.opacity = 0.7 + 0.3 * Math.sin(time.current * 12);
    }
  });

  return (
    <group ref={beamRef} position={[5, 0, 0]}>
      {/* Outer glow halo */}
      <mesh ref={outerRef} position={[4, 0, 0]} rotation={[0, 0, Math.PI / 2]} visible={false}>
        <cylinderGeometry args={[0.22, 0.22, 8, 16]} />
        <meshBasicMaterial color="#1d4ed8" transparent opacity={0.06} side={THREE.BackSide} />
      </mesh>
      {/* Mid glow */}
      <mesh ref={glowRef} position={[4, 0, 0]} rotation={[0, 0, Math.PI / 2]} visible={false}>
        <cylinderGeometry args={[0.1, 0.1, 8, 16]} />
        <meshBasicMaterial color="#3b82f6" transparent opacity={0.18} side={THREE.BackSide} />
      </mesh>
      {/* Core beam */}
      <mesh ref={coreRef} position={[4, 0, 0]} rotation={[0, 0, Math.PI / 2]} visible={false}>
        <cylinderGeometry args={[0.022, 0.022, 8, 12]} />
        <meshBasicMaterial color="#93c5fd" transparent opacity={0.9} />
      </mesh>
      {/* Muzzle flash at tip */}
      {active && (
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshBasicMaterial color="#60a5fa" transparent opacity={0.6} />
        </mesh>
      )}
    </group>
  );
}

// ─── Shahed Drone Target ──────────────────────────────────────────
function ShahedDrone({ visible, hit }: { visible: boolean; hit: boolean }) {
  const groupRef = useRef<THREE.Group>(null);
  const time = useRef(0);
  const hitTime = useRef(0);

  useFrame((_, delta) => {
    time.current += delta;
    if (!groupRef.current) return;

    if (hit) {
      hitTime.current += delta;
      groupRef.current.rotation.x += delta * 4;
      groupRef.current.rotation.z += delta * 2.5;
      groupRef.current.position.y -= delta * 0.8;
      groupRef.current.position.x -= delta * 0.3;
    } else {
      // Slow approach
      const approach = time.current * 0.25;
      groupRef.current.position.x = 14 - approach;
      groupRef.current.position.y = 1.5 + Math.sin(time.current * 0.9) * 0.15;
      groupRef.current.position.z = Math.sin(time.current * 0.4) * 0.3;
    }
  });

  if (!visible) return null;

  return (
    <group ref={groupRef} position={[14, 1.5, 0]}>
      {/* Fuselage */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.07, 0.055, 0.75, 14]} />
        <meshStandardMaterial
          color={hit ? '#7f1d1d' : '#4b5563'}
          metalness={0.4}
          roughness={0.6}
          emissive={hit ? '#ef4444' : '#000000'}
          emissiveIntensity={hit ? 0.4 : 0}
        />
      </mesh>
      {/* Nose */}
      <mesh position={[0.42, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <coneGeometry args={[0.055, 0.15, 10]} />
        <meshStandardMaterial color={hit ? '#7f1d1d' : '#374151'} metalness={0.3} roughness={0.7} />
      </mesh>
      {/* Wings */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.45, 0.015, 0.85]} />
        <meshStandardMaterial color={hit ? '#7f1d1d' : '#374151'} metalness={0.25} roughness={0.75} />
      </mesh>
      {/* Tail fins */}
      <mesh position={[-0.32, 0.1, 0]}>
        <boxGeometry args={[0.18, 0.14, 0.015]} />
        <meshStandardMaterial color={hit ? '#7f1d1d' : '#1f2937'} />
      </mesh>
      <mesh position={[-0.32, 0, 0.1]}>
        <boxGeometry args={[0.18, 0.015, 0.14]} />
        <meshStandardMaterial color={hit ? '#7f1d1d' : '#1f2937'} />
      </mesh>
      {/* Engine exhaust */}
      <mesh position={[-0.4, 0, 0]}>
        <sphereGeometry args={[0.035, 10, 10]} />
        <meshBasicMaterial color={hit ? '#ff2200' : '#ff6600'} />
      </mesh>
      {/* Target reticle */}
      {!hit && (
        <Html position={[0, 0.38, 0]} center style={{ pointerEvents: 'none' }}>
          <div style={{
            fontFamily: 'JetBrains Mono', fontSize: '8px', color: '#ef4444',
            border: '1px solid #ef4444', padding: '2px 6px', borderRadius: '2px',
            background: 'rgba(0,0,0,0.7)', whiteSpace: 'nowrap',
            boxShadow: '0 0 8px rgba(239,68,68,0.4)',
          }}>
            ◎ SHAHED-136 · TARGET LOCKED
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
    x: 1.0, y: 1.1,
    label: 'Tier 1',
    arabicDesc: 'خزان طاقة عالي الكثافة',
    enDesc: 'High-Density Energy Reservoir\nKVI-3 Capacitor Matrix',
    color: '#0d9488',
  },
  {
    x: 2.025, y: 1.15,
    label: 'Tier 2',
    arabicDesc: 'درع EMI نحاسي',
    enDesc: 'Copper EMI Shield\n200–205mm Bulkhead',
    color: '#b87333',
  },
  {
    x: 2.775, y: 1.15,
    label: 'Tier 3',
    arabicDesc: 'مضخمات GaN مع زعانف تبريد',
    enDesc: 'GaN Power Amplifiers\nHorizontal Cooling Fins',
    color: '#ff6b35',
  },
  {
    x: 4.25, y: 0.75,
    label: 'Tier 4',
    arabicDesc: 'مصفوفة الطور الذهبية',
    enDesc: 'Conformal Gold Phased Array\nRAM-lined Radiating Surface',
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
  // Exploded view offsets (animated via AnimatedGroup)
  const explodeOffsets = mode === 'exploded'
    ? { t1: -2.0, t2: -0.65, t3: 0.65, t4: 2.0 }
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
      {/* ── Lighting ──────────────────────────────────────────── */}
      <ambientLight intensity={0.25} />
      <directionalLight position={[10, 10, 5]} intensity={1.4} color="#ffffff" castShadow shadow-mapSize={[2048, 2048]} />
      <directionalLight position={[-6, 6, -4]} intensity={0.7} color="#b0d4ff" />
      <pointLight position={[2.5, 4, 4]} intensity={1.0} color="#3b82f6" distance={12} />
      <pointLight position={[2.5, -3, -3]} intensity={0.5} color="#f59e0b" distance={10} />
      <spotLight position={[0, 6, 2]} angle={0.35} penumbra={0.6} intensity={0.8} color="#ffffff" target-position={[2.5, 0, 0]} />

      {/* Studio environment map for metallic reflections */}
      <Environment preset="studio" />

      {/* Contact shadow on ground */}
      <ContactShadows
        position={[2.5, -1.6, 0]}
        opacity={0.45}
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

      {/* ── THE PAYLOAD ─────────────────────────────────────── */}

      {/* Radome shell */}
      <RadomeShell opacity={radomeOpacity} />

      {/* Tier 1: KVI-3 Capacitor Matrix (0–2.0 units) */}
      <AnimatedGroup targetX={explodeOffsets.t1}>
        <Tier1Capacitors />
      </AnimatedGroup>

      {/* Tier 2: Copper EMI Shield (2.0–2.05 units) */}
      <AnimatedGroup targetX={explodeOffsets.t2}>
        <Tier2EMIShield />
      </AnimatedGroup>

      {/* Tier 3: GaN Amplifiers (2.05–3.5 units) */}
      <AnimatedGroup targetX={explodeOffsets.t3}>
        <Tier3GaN />
      </AnimatedGroup>

      {/* Tier 4: Conformal Gold Phased Array (3.5–5.0 units) */}
      <AnimatedGroup targetX={explodeOffsets.t4}>
        <Tier4PhasedArray />
      </AnimatedGroup>

      {/* HPM Beam */}
      <HPMBeam active={attackActive} />

      {/* Shahed drone */}
      <ShahedDrone visible={mode === 'attack'} hit={droneHit} />

      {/* Presentation / Exploded annotations */}
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
            minWidth: '140px',
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
