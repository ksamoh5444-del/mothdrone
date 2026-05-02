/**
 * proceduralMaterials.ts
 * ─────────────────────────────────────────────────────────────────
 * Procedural texture generation for pristine prototype aesthetic.
 * All textures are generated on-the-fly to avoid asset pipeline complexity.
 */

import * as THREE from 'three';

/**
 * Polished copper surface texture
 * High metalness, smooth with subtle micro-scratches
 */
export function createPolishedCopperTexture(): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Base copper color
  ctx.fillStyle = '#b87333';
  ctx.fillRect(0, 0, 512, 512);

  // Subtle directional scratches (polishing marks)
  ctx.strokeStyle = 'rgba(255,255,255,0.03)';
  ctx.lineWidth = 0.5;
  for (let i = 0; i < 200; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const length = Math.random() * 80 + 20;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + length, y);
    ctx.stroke();
  }

  // Micro-noise for surface irregularity
  const imageData = ctx.getImageData(0, 0, 512, 512);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 8;
    data[i] += noise;
    data[i + 1] += noise * 0.8;
    data[i + 2] += noise * 0.6;
  }
  ctx.putImageData(imageData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  return texture;
}

/**
 * Brushed aluminum surface texture
 * Directional grain pattern, matte finish
 */
export function createBrushedAluminumTexture(): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Base aluminum color
  ctx.fillStyle = '#a8a8a8';
  ctx.fillRect(0, 0, 512, 256);

  // Directional brush strokes (horizontal)
  for (let y = 0; y < 256; y += 2) {
    ctx.strokeStyle = `rgba(0,0,0,${Math.random() * 0.08})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(512, y);
    ctx.stroke();
  }

  // Fine grain overlay
  const imageData = ctx.getImageData(0, 0, 512, 256);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const grain = (Math.random() - 0.5) * 6;
    data[i] += grain;
    data[i + 1] += grain;
    data[i + 2] += grain;
  }
  ctx.putImageData(imageData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

/**
 * PCB substrate texture (FR-4)
 * Copper traces on green substrate
 */
export function createPCBSubstrateTexture(): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // FR-4 green substrate
  ctx.fillStyle = '#0d1b2a';
  ctx.fillRect(0, 0, 512, 256);

  // Copper trace pattern (horizontal lines)
  ctx.strokeStyle = '#b45309';
  ctx.lineWidth = 3;
  for (let i = 0; i < 8; i++) {
    ctx.beginPath();
    ctx.moveTo(0, (i + 1) * 30);
    ctx.lineTo(512, (i + 1) * 30);
    ctx.stroke();
  }

  // Via pads (small circles)
  ctx.fillStyle = '#d4af37';
  for (let i = 0; i < 40; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 256;
    ctx.beginPath();
    ctx.arc(x, y, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  return texture;
}

/**
 * RAM (Radar Absorbing Material) texture
 * Deep black, highly absorptive appearance
 */
export function createRAMTexture(): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Base RAM black
  ctx.fillStyle = '#050505';
  ctx.fillRect(0, 0, 256, 256);

  // Pyramidal absorber pattern (subtle)
  ctx.strokeStyle = 'rgba(0,0,0,0.5)';
  ctx.lineWidth = 0.5;
  for (let i = 0; i < 256; i += 8) {
    for (let j = 0; j < 256; j += 8) {
      ctx.beginPath();
      ctx.moveTo(i, j);
      ctx.lineTo(i + 4, j + 4);
      ctx.lineTo(i + 8, j);
      ctx.stroke();
    }
  }

  // Surface roughness
  const imageData = ctx.getImageData(0, 0, 256, 256);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 4;
    data[i] += noise;
    data[i + 1] += noise;
    data[i + 2] += noise;
  }
  ctx.putImageData(imageData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  return texture;
}

/**
 * Gold trace texture
 * Highly reflective with slight oxidation resistance
 */
export function createGoldTraceTexture(): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  // Base gold
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(0, 0, 256, 128);

  // Directional polish marks
  ctx.strokeStyle = 'rgba(255,255,255,0.08)';
  ctx.lineWidth = 0.3;
  for (let i = 0; i < 100; i++) {
    const x = Math.random() * 256;
    const y = Math.random() * 128;
    const length = Math.random() * 40 + 10;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + length, y);
    ctx.stroke();
  }

  // Micro-texture
  const imageData = ctx.getImageData(0, 0, 256, 128);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 4;
    data[i] += noise;
    data[i + 1] += noise * 0.9;
    data[i + 2] += noise * 0.7;
  }
  ctx.putImageData(imageData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  texture.wrapS = THREE.RepeatWrapping;
  return texture;
}

/**
 * Ceramic substrate texture (GaN modules)
 * Matte finish with subtle thermal discoloration
 */
export function createCeramicSubstrateTexture(): THREE.Texture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Base ceramic (dark gray)
  ctx.fillStyle = '#2d2d2d';
  ctx.fillRect(0, 0, 256, 256);

  // Thermal gradient (slight reddish tint on edges)
  const grad = ctx.createRadialGradient(128, 128, 50, 128, 128, 180);
  grad.addColorStop(0, 'rgba(255,255,255,0)');
  grad.addColorStop(1, 'rgba(255,100,50,0.05)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);

  // Surface roughness
  const imageData = ctx.getImageData(0, 0, 256, 256);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 8;
    data[i] += noise;
    data[i + 1] += noise;
    data[i + 2] += noise;
  }
  ctx.putImageData(imageData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  return texture;
}
