/**
 * PulsePropagation.tsx
 * ─────────────────────────────────────────────────────────────────
 * Animated pulse wave propagation along the energy kill chain.
 * Shows energy flowing: Tier 1 (pulse) → Tier 3 (amplify) → Tier 4 (emit)
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface PulsePropagationProps {
  active: boolean; // Triggered during attack sequence
  mode: 'charging' | 'amplifying' | 'emitting';
}

export function PulsePropagation({ active, mode }: PulsePropagationProps) {
  const groupRef = useRef<THREE.Group>(null);
  const time = useRef(0);
  const pulseParticles = useRef<THREE.InstancedMesh>(null);

  useFrame((_, delta) => {
    time.current += delta;

    if (!active || !pulseParticles.current) return;

    // Update particle positions based on mode and time
    const particleCount = 32;
    const dummy = new THREE.Object3D();

    for (let i = 0; i < particleCount; i++) {
      const progress = (time.current * 2 + i / particleCount) % 1;
      let x, y, z, scale, opacity;

      if (mode === 'charging') {
        // Pulse traveling from Tier 1 to Tier 3 (teal)
        x = 1.0 + progress * 1.775;
        y = Math.sin(progress * Math.PI * 4) * 0.15;
        z = Math.cos(progress * Math.PI * 3) * 0.15;
        scale = 0.08 * (1 - Math.abs(progress - 0.5) * 2);
        opacity = Math.max(0, 1 - progress);
      } else if (mode === 'amplifying') {
        // RF energy traveling from Tier 3 to Tier 4 (gold)
        x = 2.775 + progress * 1.475;
        y = Math.sin(progress * Math.PI * 6) * 0.1;
        z = Math.cos(progress * Math.PI * 5) * 0.1;
        scale = 0.06 * (1 - Math.abs(progress - 0.5) * 2.5);
        opacity = Math.max(0, 1 - progress);
      } else {
        // Beam emission from Tier 4 (blue)
        x = 4.25 + progress * 8;
        y = Math.sin(progress * Math.PI * 8) * 0.2;
        z = Math.cos(progress * Math.PI * 7) * 0.2;
        scale = 0.12 * (1 - progress);
        opacity = Math.max(0, 1 - progress * 1.5);
      }

      dummy.position.set(x, y, z);
      dummy.scale.setScalar(scale);
      dummy.updateMatrix();
      pulseParticles.current.setMatrixAt(i, dummy.matrix);
    }

    pulseParticles.current.instanceMatrix.needsUpdate = true;
  });

  // Particle geometry and material
  const particleGeometry = useMemo(() => new THREE.SphereGeometry(1, 6, 6), []);
  const particleMaterial = useMemo(() => {
    if (mode === 'charging') {
      return new THREE.MeshBasicMaterial({
        color: '#0d9488',
        transparent: true,
        opacity: 0.7,
      });
    } else if (mode === 'amplifying') {
      return new THREE.MeshBasicMaterial({
        color: '#f59e0b',
        transparent: true,
        opacity: 0.65,
      });
    } else {
      return new THREE.MeshBasicMaterial({
        color: '#60a5fa',
        transparent: true,
        opacity: 0.8,
      });
    }
  }, [mode]);

  return (
    <group ref={groupRef}>
      {active && (
        <instancedMesh
          ref={pulseParticles}
          args={[particleGeometry, particleMaterial, 32]}
          frustumCulled={false}
        />
      )}

      {/* Pulse wave trails (visual emphasis) */}
      {active && mode === 'charging' && (
        <mesh position={[1.0 + (time.current % 1.775), 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.12, 0.12, 0.04, 16]} />
          <meshBasicMaterial
            color="#0d9488"
            transparent
            opacity={0.4 - (time.current % 1) * 0.4}
          />
        </mesh>
      )}

      {active && mode === 'amplifying' && (
        <mesh position={[2.775 + (time.current % 1.475), 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.1, 0.1, 0.03, 14]} />
          <meshBasicMaterial
            color="#f59e0b"
            transparent
            opacity={0.35 - (time.current % 1) * 0.35}
          />
        </mesh>
      )}

      {active && mode === 'emitting' && (
        <mesh position={[4.25 + (time.current * 8 % 8), 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.15, 0.15, 0.05, 18]} />
          <meshBasicMaterial
            color="#60a5fa"
            transparent
            opacity={0.45 - (time.current % 1) * 0.45}
          />
        </mesh>
      )}
    </group>
  );
}

/**
 * Pulse propagation controller for orchestrating the kill chain animation
 */
export function usePulsePropagation(attackActive: boolean) {
  const pulseState = useRef<{
    phase: 'idle' | 'charging' | 'amplifying' | 'emitting';
    startTime: number;
  }>({
    phase: 'idle',
    startTime: 0,
  });

  useFrame((_, delta) => {
    const elapsed = Date.now() - pulseState.current.startTime;

    if (attackActive) {
      if (pulseState.current.phase === 'idle') {
        pulseState.current.phase = 'charging';
        pulseState.current.startTime = Date.now();
      } else if (pulseState.current.phase === 'charging' && elapsed > 1800) {
        pulseState.current.phase = 'amplifying';
        pulseState.current.startTime = Date.now();
      } else if (pulseState.current.phase === 'amplifying' && elapsed > 1500) {
        pulseState.current.phase = 'emitting';
        pulseState.current.startTime = Date.now();
      }
    } else {
      pulseState.current.phase = 'idle';
    }
  });

  return pulseState.current.phase;
}
