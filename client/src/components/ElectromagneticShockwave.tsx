/**
 * ElectromagneticShockwave.tsx
 * ─────────────────────────────────────────────────────────────────
 * Expanding concentric torus rings representing HPM electromagnetic pulse.
 * Emits from Tier 4 apex with expanding wavefront animation.
 */

import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';

interface ElectromagneticShockwaveProps {
  active: boolean;
  position?: [number, number, number];
}

export default function ElectromagneticShockwave({
  active,
  position = [5.0, 0, 0],
}: ElectromagneticShockwaveProps) {
  const groupRef = useRef<THREE.Group>(null);
  const ringsRef = useRef<THREE.Mesh[]>([]);
  const timeRef = useRef(0);

  useEffect(() => {
    if (!groupRef.current) return;

    if (active) {
      // Reset animation
      timeRef.current = 0;
      ringsRef.current.forEach((ring) => {
        ring.scale.set(0.1, 0.1, 0.1);
        (ring.material as any).opacity = 1.0;
      });

      // Animate each ring with staggered timing
      ringsRef.current.forEach((ring, idx) => {
        const delay = idx * 0.08;
        gsap.to(ring.scale, {
          x: 3.5,
          y: 3.5,
          z: 3.5,
          duration: 1.2,
          delay,
          ease: 'power2.out',
        });
        gsap.to((ring.material as any), {
          opacity: 0,
          duration: 1.2,
          delay,
          ease: 'power2.in',
        });
      });
    }
  }, [active]);

  useFrame(() => {
    if (!groupRef.current) return;
    timeRef.current += 0.016;
  });

  // Create 5 concentric torus rings
  const rings = Array.from({ length: 5 }, (_, i) => {
    const torusGeometry = new THREE.TorusGeometry(0.8, 0.15, 16, 32);
    const torusMaterial = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#00aaff'),
      emissive: new THREE.Color('#0088ff'),
      emissiveIntensity: 0.8,
      metalness: 0.6,
      roughness: 0.2,
      transparent: true,
      opacity: 1.0,
      side: THREE.DoubleSide,
    });

    return { geometry: torusGeometry, material: torusMaterial };
  });

  return (
    <group ref={groupRef} position={position}>
      {rings.map((ring, idx) => (
        <mesh
          key={idx}
          ref={(mesh) => {
            if (mesh) ringsRef.current[idx] = mesh;
          }}
          geometry={ring.geometry}
          material={ring.material}
          rotation={[Math.PI * 0.5, 0, idx * (Math.PI / 5)]}
          scale={[0.1, 0.1, 0.1]}
        />
      ))}
    </group>
  );
}
