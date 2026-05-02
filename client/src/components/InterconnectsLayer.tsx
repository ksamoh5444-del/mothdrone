/**
 * InterconnectsLayer.tsx — Correct Energy Kill Chain
 * ─────────────────────────────────────────────────────────────────
 * ENERGY FLOW: Tier 1 (PULSE) → Tier 3 (AMPLIFY) → Tier 4 (EMIT)
 *
 * Primary interconnects:
 *   - High-voltage pulse buses: T1 → T3 (teal)
 *   - Main RF waveguide: T3 → T4 (gold)
 *   - Thermal cooling channels: T3 fins
 *   - Ground return paths: T1 ↔ T3 ↔ T4
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function InterconnectsLayer() {
  const groupRef = useRef<THREE.Group>(null);
  const time = useRef(0);

  useFrame((_, delta) => {
    time.current += delta;
  });

  // ─── High-Voltage Pulse Buses (Tier 1 → Tier 3) ──────────────────
  // Three main teal traces carrying the high-voltage pulse from KVI-3 capacitors to GaN amplifiers
  const pulseBuses = useMemo(() => {
    const buses: { start: [number, number, number]; end: [number, number, number]; color: string; width: number }[] = [];

    // Bus 1: Top trace (T1 → T3)
    buses.push({
      start: [1.0, 0.35, 0],
      end: [2.775, 0.35, 0],
      color: '#0d9488',
      width: 0.022,
    });

    // Bus 2: Middle trace (T1 → T3)
    buses.push({
      start: [1.0, 0, 0],
      end: [2.775, 0, 0],
      color: '#0d9488',
      width: 0.022,
    });

    // Bus 3: Bottom trace (T1 → T3)
    buses.push({
      start: [1.0, -0.35, 0],
      end: [2.775, -0.35, 0],
      color: '#0d9488',
      width: 0.022,
    });

    return buses;
  }, []);

  // ─── RF Waveguide (Tier 3 → Tier 4) ──────────────────────────────
  // Main waveguide feed from GaN amplifiers to phased array antenna
  // (Already rendered as part of Tier 3 geometry — central cylindrical waveguide)
  // This layer adds the RF feed traces connecting the waveguide to the antenna patches

  // ─── Secondary RF Feeds (Tier 3 → Tier 4) ──────────────────────
  // 6 secondary RF feeds from GaN modules to phased array feed network
  const rfFeeds = useMemo(() => {
    const feeds: { angle: number; radius: number }[] = [];
    for (let i = 0; i < 6; i++) {
      feeds.push({
        angle: (i / 6) * Math.PI * 2,
        radius: 0.45,
      });
    }
    return feeds;
  }, []);

  // ─── Ground Return Paths (T1 ↔ T3 ↔ T4) ──────────────────────────
  // Copper traces connecting ground planes across all tiers
  const groundPaths = useMemo(() => {
    const paths: { start: [number, number, number]; end: [number, number, number] }[] = [];

    // T1 to T2 (through EMI shield)
    paths.push({
      start: [1.9, 0.45, 0],
      end: [2.05, 0.45, 0],
    });
    paths.push({
      start: [1.9, -0.45, 0],
      end: [2.05, -0.45, 0],
    });

    // T2 to T3 (through EMI shield)
    paths.push({
      start: [2.05, 0.45, 0],
      end: [2.1, 0.45, 0],
    });
    paths.push({
      start: [2.05, -0.45, 0],
      end: [2.1, -0.45, 0],
    });

    // T3 to T4 (return path)
    paths.push({
      start: [3.4, 0.5, 0],
      end: [3.8, 0.5, 0],
    });
    paths.push({
      start: [3.4, -0.5, 0],
      end: [3.8, -0.5, 0],
    });

    return paths;
  }, []);

  return (
    <group ref={groupRef}>
      {/* ─── High-Voltage Pulse Buses (T1 → T3) ────────────────────── */}
      {pulseBuses.map((bus, idx) => {
        const [sx, sy, sz] = bus.start;
        const [ex, ey, ez] = bus.end;
        const length = Math.sqrt((ex - sx) ** 2 + (ey - sy) ** 2 + (ez - sz) ** 2);
        const midX = (sx + ex) / 2;
        const midY = (sy + ey) / 2;
        const midZ = (sz + ez) / 2;
        const angle = Math.atan2(ey - sy, ex - sx);

        return (
          <mesh key={`pulse-bus-${idx}`} position={[midX, midY, midZ]} rotation={[0, 0, angle]}>
            <boxGeometry args={[length, bus.width, 0.008]} />
            <meshStandardMaterial
              color={bus.color}
              metalness={0.96}
              roughness={0.04}
              emissive={bus.color}
              emissiveIntensity={0.28}
            />
          </mesh>
        );
      })}

      {/* ─── Secondary RF Feeds (Tier 3 → Tier 4) ─────────────────── */}
      {rfFeeds.map(({ angle, radius }, idx) => {
        const startX = 2.775 + Math.sin(angle) * radius * 0.48;
        const startY = Math.sin(angle) * radius;
        const startZ = Math.cos(angle) * radius;
        const endX = 4.0 + Math.sin(angle) * radius * 0.35;
        const endY = Math.sin(angle) * radius * 0.68;
        const endZ = Math.cos(angle) * radius * 0.68;

        const length = Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2 + (endZ - startZ) ** 2);
        const midX = (startX + endX) / 2;
        const midY = (startY + endY) / 2;
        const midZ = (startZ + endZ) / 2;

        const dir = new THREE.Vector3(endX - startX, endY - startY, endZ - startZ).normalize();
        const quat = new THREE.Quaternion();
        quat.setFromUnitVectors(new THREE.Vector3(1, 0, 0), dir);

        return (
          <mesh key={`rf-feed-${idx}`} position={[midX, midY, midZ]} quaternion={quat}>
            <boxGeometry args={[length, 0.01, 0.01]} />
            <meshStandardMaterial
              color="#f59e0b"
              metalness={0.98}
              roughness={0.02}
              emissive="#f59e0b"
              emissiveIntensity={0.35}
            />
          </mesh>
        );
      })}

      {/* ─── Ground Return Paths ──────────────────────────────────── */}
      {groundPaths.map(({ start, end }, idx) => {
        const [sx, sy, sz] = start;
        const [ex, ey, ez] = end;
        const length = Math.sqrt((ex - sx) ** 2 + (ey - sy) ** 2 + (ez - sz) ** 2);
        const midX = (sx + ex) / 2;
        const midY = (sy + ey) / 2;
        const midZ = (sz + ez) / 2;
        const angle = Math.atan2(ey - sy, ex - sx);

        return (
          <mesh key={`gnd-${idx}`} position={[midX, midY, midZ]} rotation={[0, 0, angle]}>
            <boxGeometry args={[length, 0.014, 0.005]} />
            <meshStandardMaterial
              color="#8b6914"
              metalness={0.90}
              roughness={0.10}
            />
          </mesh>
        );
      })}

      {/* ─── Mechanical Connectors (Pulse Path) ────────────────────── */}
      {/* T1 to T3 pulse connectors (6 points around the payload) */}
      {Array.from({ length: 6 }, (_, i) => {
        const angle = (i / 6) * Math.PI * 2;
        const x = 1.85 + (i % 2) * 0.9;
        const y = Math.sin(angle) * 0.35;
        const z = Math.cos(angle) * 0.35;
        return (
          <mesh key={`conn-pulse-${i}`} position={[x, y, z]}>
            <cylinderGeometry args={[0.014, 0.014, 0.06, 10]} />
            <meshStandardMaterial color="#0d9488" metalness={0.88} roughness={0.12} emissive="#0d9488" emissiveIntensity={0.15} />
          </mesh>
        );
      })}

      {/* ─── RF Waveguide Connectors (T3 to T4) ────────────────────── */}
      {[0, 90, 180, 270].map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        const x = 3.4 + Math.sin(rad) * 0.4;
        const y = Math.sin(rad) * 0.4;
        const z = Math.cos(rad) * 0.4;
        return (
          <mesh key={`conn-rf-${i}`} position={[x, y, z]}>
            <cylinderGeometry args={[0.015, 0.015, 0.07, 10]} />
            <meshStandardMaterial color="#f59e0b" metalness={0.96} roughness={0.06} emissive="#f59e0b" emissiveIntensity={0.2} />
          </mesh>
        );
      })}

      {/* ─── Thermal Duct Visualization (T3 cooling) ───────────────── */}
      {/* Already rendered as part of Tier 3 geometry (cooling fins and channels) */}
      {/* This adds visual emphasis to the thermal routing */}
      {[0, 60, 120, 180, 240, 300].map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        const x = 2.775;
        const y = Math.sin(rad) * 0.72;
        const z = Math.cos(rad) * 0.72;
        return (
          <mesh key={`thermal-${i}`} position={[x, y, z]}>
            <boxGeometry args={[1.4, 0.008, 0.12]} />
            <meshStandardMaterial
              color="#ff6b35"
              metalness={0.35}
              roughness={0.65}
              emissive="#ff6b35"
              emissiveIntensity={0.08}
            />
          </mesh>
        );
      })}
    </group>
  );
}
