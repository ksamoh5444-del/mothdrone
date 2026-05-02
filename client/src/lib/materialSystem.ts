/**
 * materialSystem.ts
 * ─────────────────────────────────────────────────────────────────
 * High-fidelity engineering material definitions for Mothdrone.
 * All materials use procedurally generated textures for pristine prototype aesthetic.
 */

import * as THREE from 'three';

/**
 * Material definitions for each tier
 */
export const MATERIALS = {
  // ─── Tier 1: KVI-3 Capacitors ────────────────────────────────────
  tier1: {
    // Capacitor body (aluminum electrolytic can)
    capacitorBody: () => new THREE.MeshStandardMaterial({
      color: '#a1a5aa',
      metalness: 0.65,
      roughness: 0.25,
      emissive: '#0d9488',
      emissiveIntensity: 0.08,
    }),
    // Capacitor terminals (gold-plated)
    capacitorTerminal: () => new THREE.MeshStandardMaterial({
      color: '#d4af37',
      metalness: 0.98,
      roughness: 0.04,
    }),
    // PCB substrate (FR-4)
    pcbSubstrate: () => new THREE.MeshStandardMaterial({
      color: '#0d1b2a',
      metalness: 0.08,
      roughness: 0.85,
    }),
    // Ground plane (copper)
    groundPlane: () => new THREE.MeshStandardMaterial({
      color: '#b87333',
      metalness: 0.92,
      roughness: 0.08,
    }),
    // Input power traces (teal, emissive)
    powerTrace: () => new THREE.MeshStandardMaterial({
      color: '#0d9488',
      metalness: 0.95,
      roughness: 0.05,
      emissive: '#0d9488',
      emissiveIntensity: 0.25,
    }),
  },

  // ─── Tier 2: Copper EMI Shield ───────────────────────────────────
  tier2: {
    // Polished copper shield (high reflectivity)
    copperShield: () => new THREE.MeshStandardMaterial({
      color: '#b87333',
      metalness: 0.98,
      roughness: 0.04,
      envMapIntensity: 2.8,
    }),
    // Reinforcement ring
    reinforcementRing: () => new THREE.MeshStandardMaterial({
      color: '#c8843a',
      metalness: 0.96,
      roughness: 0.06,
    }),
    // Mounting posts (brass-like)
    mountingPost: () => new THREE.MeshStandardMaterial({
      color: '#8b6914',
      metalness: 0.85,
      roughness: 0.15,
    }),
  },

  // ─── Tier 3: GaN Amplifiers & Cooling ────────────────────────────
  tier3: {
    // Waveguide (aluminum, matte)
    waveguide: () => new THREE.MeshStandardMaterial({
      color: '#8b8b8b',
      metalness: 0.72,
      roughness: 0.22,
    }),
    // Waveguide interior (RAM black, absorptive)
    waveguideInterior: () => new THREE.MeshStandardMaterial({
      color: '#0a0a0a',
      metalness: 0.05,
      roughness: 0.95,
    }),
    // GaN module body (ceramic substrate, matte grey)
    ganModule: () => new THREE.MeshStandardMaterial({
      color: '#2d2d2d',
      metalness: 0.45,
      roughness: 0.55,
      emissive: '#ff4500',
      emissiveIntensity: 0.06,
    }),
    // GaN terminals (gold-plated)
    ganTerminal: () => new THREE.MeshStandardMaterial({
      color: '#d4af37',
      metalness: 0.96,
      roughness: 0.06,
    }),
    // Cooling fins (brushed aluminum)
    coolingFin: () => new THREE.MeshStandardMaterial({
      color: '#a8a8a8',
      metalness: 0.68,
      roughness: 0.32,
    }),
    // Thermal air-flow channels
    thermalChannel: () => new THREE.MeshStandardMaterial({
      color: '#4a4a4a',
      metalness: 0.4,
      roughness: 0.6,
    }),
    // Fin connector rings
    finConnector: () => new THREE.MeshStandardMaterial({
      color: '#6b7280',
      metalness: 0.82,
      roughness: 0.18,
    }),
  },

  // ─── Tier 4: Phased Array Antenna ───────────────────────────────
  tier4: {
    // RAM lining (highly absorptive black)
    ramLining: () => new THREE.MeshStandardMaterial({
      color: '#050505',
      metalness: 0.02,
      roughness: 0.98,
      side: THREE.BackSide,
    }),
    // Gold antenna patches (emissive)
    antennaPatch: () => new THREE.MeshStandardMaterial({
      color: '#d97706',
      metalness: 0.97,
      roughness: 0.03,
      emissive: '#f59e0b',
      emissiveIntensity: 0.32,
    }),
    // Primary RF feeds (gold, highly emissive)
    rfFeedPrimary: () => new THREE.MeshStandardMaterial({
      color: '#f59e0b',
      metalness: 0.99,
      roughness: 0.01,
      emissive: '#f59e0b',
      emissiveIntensity: 0.42,
    }),
    // Secondary phasing traces (gold, less emissive)
    rfFeedSecondary: () => new THREE.MeshStandardMaterial({
      color: '#fbbf24',
      metalness: 0.97,
      roughness: 0.04,
      emissive: '#fbbf24',
      emissiveIntensity: 0.25,
    }),
  },

  // ─── Interconnects Layer ──────────────────────────────────────────
  interconnects: {
    // High-voltage pulse buses (teal, emissive)
    pulseBus: () => new THREE.MeshStandardMaterial({
      color: '#0d9488',
      metalness: 0.96,
      roughness: 0.04,
      emissive: '#0d9488',
      emissiveIntensity: 0.28,
    }),
    // RF waveguide feeds (gold, emissive)
    rfFeed: () => new THREE.MeshStandardMaterial({
      color: '#f59e0b',
      metalness: 0.98,
      roughness: 0.02,
      emissive: '#f59e0b',
      emissiveIntensity: 0.35,
    }),
    // Ground return paths (copper)
    groundReturn: () => new THREE.MeshStandardMaterial({
      color: '#8b6914',
      metalness: 0.90,
      roughness: 0.10,
    }),
    // Mechanical connectors (brass)
    connector: () => new THREE.MeshStandardMaterial({
      color: '#8b6914',
      metalness: 0.88,
      roughness: 0.12,
      emissive: '#0d9488',
      emissiveIntensity: 0.15,
    }),
    // Thermal duct visualization (heat-glow)
    thermalDuct: () => new THREE.MeshStandardMaterial({
      color: '#ff6b35',
      metalness: 0.35,
      roughness: 0.65,
      emissive: '#ff6b35',
      emissiveIntensity: 0.08,
    }),
  },

  // ─── Radome Shell ────────────────────────────────────────────────
  radome: () => new THREE.MeshPhysicalMaterial({
    color: '#7a9ab5',
    metalness: 0.08,
    roughness: 0.35,
    opacity: 1.0,
    transparent: true,
    envMapIntensity: 1.2,
    depthWrite: true,
  }),

  // ─── HPM Beam ────────────────────────────────────────────────────
  hpmBeam: {
    // Outer beam envelope (low opacity)
    outer: () => new THREE.MeshBasicMaterial({
      color: '#1d4ed8',
      transparent: true,
      opacity: 0.05,
      side: THREE.BackSide,
    }),
    // Middle glow layer
    glow: () => new THREE.MeshBasicMaterial({
      color: '#3b82f6',
      transparent: true,
      opacity: 0.2,
      side: THREE.BackSide,
    }),
    // Core beam (bright blue)
    core: () => new THREE.MeshBasicMaterial({
      color: '#93c5fd',
      transparent: true,
      opacity: 0.92,
    }),
    // Beam origin glow
    origin: () => new THREE.MeshBasicMaterial({
      color: '#60a5fa',
      transparent: true,
      opacity: 0.65,
    }),
  },

  // ─── Shahed Drone Target ─────────────────────────────────────────
  shahedDrone: {
    // Fuselage (dark grey)
    fuselage: (hit: boolean) => new THREE.MeshStandardMaterial({
      color: hit ? '#7f1d1d' : '#4b5563',
      metalness: 0.4,
      roughness: 0.6,
      emissive: hit ? '#ef4444' : '#000000',
      emissiveIntensity: hit ? 0.4 : 0,
    }),
    // Nose cone
    noseCone: (hit: boolean) => new THREE.MeshStandardMaterial({
      color: hit ? '#7f1d1d' : '#374151',
      metalness: 0.3,
      roughness: 0.7,
    }),
    // Wings/control surfaces
    controlSurface: (hit: boolean) => new THREE.MeshStandardMaterial({
      color: hit ? '#7f1d1d' : '#1f2937',
    }),
    // Engine/propulsion indicator
    engine: (hit: boolean) => new THREE.MeshBasicMaterial({
      color: hit ? '#ff2200' : '#ff6600',
    }),
  },
};

/**
 * Create a material cache to avoid recreating materials on every render
 */
export class MaterialCache {
  private cache: Map<string, THREE.Material> = new Map();

  get(key: string, factory: () => THREE.Material): THREE.Material {
    if (!this.cache.has(key)) {
      this.cache.set(key, factory());
    }
    return this.cache.get(key)!;
  }

  clear() {
    this.cache.forEach((mat) => mat.dispose());
    this.cache.clear();
  }
}

/**
 * Lighting configuration for studio-grade rendering
 */
export const LIGHTING_CONFIG = {
  ambient: {
    intensity: 0.28,
    color: '#ffffff',
  },
  directional: {
    position: [10, 10, 5] as [number, number, number],
    intensity: 1.5,
    color: '#ffffff',
    shadowMapSize: 2048,
  },
  directionalFill: {
    position: [-6, 6, -4] as [number, number, number],
    intensity: 0.8,
    color: '#b0d4ff',
  },
  pointLight1: {
    position: [2.5, 4, 4] as [number, number, number],
    intensity: 1.1,
    color: '#3b82f6',
    distance: 12,
  },
  pointLight2: {
    position: [2.5, -3, -3] as [number, number, number],
    intensity: 0.6,
    color: '#f59e0b',
    distance: 10,
  },
  spotLight: {
    position: [0, 6, 2] as [number, number, number],
    angle: 0.35,
    penumbra: 0.6,
    intensity: 0.9,
    color: '#ffffff',
    targetPosition: [2.5, 0, 0] as [number, number, number],
  },
};

/**
 * Environment and shadow configuration
 */
export const ENVIRONMENT_CONFIG = {
  preset: 'studio' as const,
  contactShadow: {
    position: [2.5, -1.6, 0] as [number, number, number],
    opacity: 0.5,
    scale: 14,
    blur: 2.8,
    far: 3.5,
    color: '#000820',
  },
  toneMapping: THREE.ACESFilmicToneMapping,
  toneMappingExposure: 1.15,
};
