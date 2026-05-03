/**
 * pbrMaterials.ts
 * ─────────────────────────────────────────────────────────────────
 * High-end PBR (Physically Based Rendering) material definitions
 * for Mothdrone components with precise metalness/roughness values.
 */

import * as THREE from 'three';

export const PBRMaterials = {
  // ─── Tier 1: KVI-3 Capacitor Matrix ───────────────────────────
  capacitorBody: {
    color: '#1a1a2e',
    metalness: 0.15,
    roughness: 0.6,
    envMapIntensity: 1.0,
  },
  capacitorLead: {
    color: '#d4af37',
    metalness: 0.92,
    roughness: 0.08,
    envMapIntensity: 1.4,
  },

  // ─── Tier 2: Copper EMI Shield ────────────────────────────────
  copperShield: {
    color: '#b87333',
    metalness: 1.0,
    roughness: 0.1,
    envMapIntensity: 1.6,
  },

  // ─── Tier 3: GaN Amplifiers & Cooling Fins ───────────────────
  ganModule: {
    color: '#2a2a3e',
    metalness: 0.3,
    roughness: 0.5,
    envMapIntensity: 1.1,
  },
  coolingFin: {
    color: '#a8a9ad',
    metalness: 0.68,
    roughness: 0.25,
    envMapIntensity: 1.3,
  },

  // ─── Tier 4: Phased Array Antenna ────────────────────────────
  goldTrace: {
    color: '#ffd700',
    metalness: 0.97,
    roughness: 0.05,
    envMapIntensity: 1.8,
    emissive: '#ffaa00',
    emissiveIntensity: 0.3,
  },
  antennaSubstrate: {
    color: '#1a1a1a',
    metalness: 0.2,
    roughness: 0.7,
    envMapIntensity: 0.9,
  },

  // ─── Radome Shell ────────────────────────────────────────────
  radome: {
    color: '#7a9ab5',
    metalness: 0.08,
    roughness: 0.35,
    envMapIntensity: 1.2,
    transmission: 0.8,
    thickness: 1.0,
  },

  // ─── Interconnects ───────────────────────────────────────────
  powerBus: {
    color: '#00d9ff',
    metalness: 0.95,
    roughness: 0.12,
    envMapIntensity: 1.5,
    emissive: '#00aaff',
    emissiveIntensity: 0.25,
  },
  waveguide: {
    color: '#ffa500',
    metalness: 0.93,
    roughness: 0.15,
    envMapIntensity: 1.4,
    emissive: '#ff8800',
    emissiveIntensity: 0.2,
  },
};

export function createPBRMaterial(spec: any) {
  const material = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(spec.color),
    metalness: spec.metalness,
    roughness: spec.roughness,
    envMapIntensity: spec.envMapIntensity,
    side: THREE.FrontSide,
    ...(spec.emissive && {
      emissive: new THREE.Color(spec.emissive),
      emissiveIntensity: spec.emissiveIntensity || 0,
    }),
  });

  return material;
}
