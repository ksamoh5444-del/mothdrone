/**
 * InterconnectsLayer.tsx
 * ─────────────────────────────────────────────────────────────────
 * Primary interconnects: power buses, waveguides, thermal channels
 * Rendered as a separate layer for clarity and visual hierarchy.
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

  // ─── Primary Power Buses (Tier 1 → Tier 2 → Tier 3) ──────────────
  // Three main teal traces carrying high voltage from capacitors through EMI shield to GaN amps
  const powerBuses = useMemo(() => {
    const buses: { start: [number, number, number]; end: [number, number, number]; color: string; width: number }[] = [];

    // Bus 1: Top trace
    buses.push({
      start: [1.0, 0.35, 0],
      end: [2.025, 0.35, 0],
      color: '#0d9488',
      width: 0.018,
    });
    buses.push({
      start: [2.025, 0.35, 0],
      end: [2.775, 0.35, 0],
      color: '#0d9488',
      width: 0.016,
    });

    // Bus 2: Middle trace
    buses.push({
      start: [1.0, 0, 0],
      end: [2.025, 0, 0],
      color: '#0d9488',
      width: 0.018,
    });
    buses.push({
      start: [2.025, 0, 0],
      end: [2.775, 0, 0],
      color: '#0d9488',
      width: 0.016,
    });

    // Bus 3: Bottom trace
    buses.push({
      start: [1.0, -0.35, 0],
      end: [2.025, -0.35, 0],
      color: '#0d9488',
      width: 0.018,
    });
    buses.push({
      start: [2.025, -0.35, 0],
      end: [2.775, -0.35, 0],
      color: '#0d9488',
      width: 0.016,
    });

    return buses;
  }, []);

  // ─── Main Waveguide (Tier 3 → Tier 4) ───────────────────────────
  // Central RF waveguide feed from GaN amplifiers to phased array
  // Already rendered in MothdroneScene as part of Tier 3 geometry

  // ─── Secondary RF Feeds (Tier 3 → Tier 4) ──────────────────────
  // 6 secondary feeds from GaN modules to phased array feed network
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

  // ─── Thermal Air-Flow Channels (Tier 3) ──────────────────────────
  // Visible RAM-lined ducts for cooling air circulation
  // Already rendered in MothdroneScene as part of Tier 3 fins

  // ─── Ground Return Paths (All Tiers) ─────────────────────────────
  // Thin copper traces connecting ground planes
  const groundPaths = useMemo(() => {
    const paths: { start: [number, number, number]; end: [number, number, number] }[] = [];

    // Tier 1 to Tier 2
    paths.push({
      start: [1.9, 0.45, 0],
      end: [2.05, 0.45, 0],
    });
    paths.push({
      start: [1.9, -0.45, 0],
      end: [2.05, -0.45, 0],
    });

    // Tier 2 to Tier 3
    paths.push({
      start: [2.05, 0.45, 0],
      end: [2.1, 0.45, 0],
    });
    paths.push({
      start: [2.05, -0.45, 0],
      end: [2.1, -0.45, 0],
    });

    return paths;
  }, []);

  return (
    <group ref={groupRef}>
      {/* ─── Primary Power Buses ──────────────────────────────────── */}
      {powerBuses.map((bus, idx) => {
        const [sx, sy, sz] = bus.start;
        const [ex, ey, ez] = bus.end;
        const length = Math.sqrt((ex - sx) ** 2 + (ey - sy) ** 2 + (ez - sz) ** 2);
        const midX = (sx + ex) / 2;
        const midY = (sy + ey) / 2;
        const midZ = (sz + ez) / 2;
        const angle = Math.atan2(ey - sy, ex - sx);

        return (
          <mesh key={`bus-${idx}`} position={[midX, midY, midZ]} rotation={[0, 0, angle]}>
            <boxGeometry args={[length, bus.width, 0.006]} />
            <meshStandardMaterial
              color={bus.color}
              metalness={0.94}
              roughness={0.05}
              emissive={bus.color}
              emissiveIntensity={0.22}
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

        // Compute rotation to align with feed direction
        const dir = new THREE.Vector3(endX - startX, endY - startY, endZ - startZ).normalize();
        const quat = new THREE.Quaternion();
        quat.setFromUnitVectors(new THREE.Vector3(1, 0, 0), dir);

        return (
          <mesh key={`rf-feed-${idx}`} position={[midX, midY, midZ]} quaternion={quat}>
            <boxGeometry args={[length, 0.008, 0.008]} />
            <meshStandardMaterial
              color="#f59e0b"
              metalness={0.96}
              roughness={0.04}
              emissive="#f59e0b"
              emissiveIntensity={0.28}
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
            <boxGeometry args={[length, 0.012, 0.004]} />
            <meshStandardMaterial
              color="#8b6914"
              metalness={0.88}
              roughness={0.12}
            />
          </mesh>
        );
      })}

      {/* ─── Connector Posts (Mechanical/Electrical) ──────────────── */}
      {/* Tier 1 to Tier 2 connectors */}
      {[0, 120, 240].map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        const x = 1.95 + Math.sin(rad) * 0.3;
        const y = Math.sin(rad) * 0.3;
        const z = Math.cos(rad) * 0.3;
        return (
          <mesh key={`conn-12-${i}`} position={[x, y, z]}>
            <cylinderGeometry args={[0.012, 0.012, 0.05, 10]} />
            <meshStandardMaterial color="#8b6914" metalness={0.82} roughness={0.18} />
          </mesh>
        );
      })}

      {/* Tier 2 to Tier 3 connectors */}
      {[0, 120, 240].map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        const x = 2.4 + Math.sin(rad) * 0.35;
        const y = Math.sin(rad) * 0.35;
        const z = Math.cos(rad) * 0.35;
        return (
          <mesh key={`conn-23-${i}`} position={[x, y, z]}>
            <cylinderGeometry args={[0.012, 0.012, 0.05, 10]} />
            <meshStandardMaterial color="#8b6914" metalness={0.82} roughness={0.18} />
          </mesh>
        );
      })}

      {/* Tier 3 to Tier 4 connectors (main waveguide + RF feeds) */}
      {[0, 90, 180, 270].map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        const x = 3.4 + Math.sin(rad) * 0.4;
        const y = Math.sin(rad) * 0.4;
        const z = Math.cos(rad) * 0.4;
        return (
          <mesh key={`conn-34-${i}`} position={[x, y, z]}>
            <cylinderGeometry args={[0.013, 0.013, 0.06, 10]} />
            <meshStandardMaterial color="#d4af37" metalness={0.94} roughness={0.08} />
          </mesh>
        );
      })}
    </group>
  );
}
