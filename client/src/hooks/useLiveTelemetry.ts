/**
 * useLiveTelemetry.ts
 * ─────────────────────────────────────────────────────────────────
 * Live telemetry hook with micro-fluctuations and pulsing critical states.
 * Simulates real-time sensor data with jitter for authentic feel.
 */

import { useState, useEffect } from 'react';
import { SceneMode } from '@/components/MothdroneScene';

export interface LiveTelemetry {
  chargeLevel: number;
  chargeVoltage: number;
  pulseEnergy: number;
  ganTemp: number;
  ganTempSparkline: number[];
  coolingFlow: number;
  beamAzimuth: number;
  beamElevation: number;
  targetRange: number;
  systemStatus: 'STANDBY' | 'CHARGING' | 'READY' | 'FIRING' | 'LOCKED';
  isPulsing: boolean;
}

export function useLiveTelemetry(mode: SceneMode): LiveTelemetry {
  const [telemetry, setTelemetry] = useState<LiveTelemetry>({
    chargeLevel: 0,
    chargeVoltage: 0,
    pulseEnergy: 0,
    ganTemp: 42,
    ganTempSparkline: Array(12).fill(42),
    coolingFlow: 0,
    beamAzimuth: 0,
    beamElevation: 0,
    targetRange: 1200,
    systemStatus: 'STANDBY',
    isPulsing: false,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetry((prev) => {
        let chargeLevel = prev.chargeLevel;
        let ganTemp = prev.ganTemp;
        let targetRange = prev.targetRange;
        let systemStatus = prev.systemStatus as any;
        let isPulsing = false;

        if (mode === 'attack') {
          chargeLevel = Math.min(100, prev.chargeLevel + 4);
          ganTemp = Math.min(220, prev.ganTemp + 3.5);
          targetRange = Math.max(0, prev.targetRange - 22);
          systemStatus = 'FIRING';
          isPulsing = true;
        } else if (mode === 'normal' || mode === 'presentation') {
          chargeLevel = prev.chargeLevel + 1.8;
          if (chargeLevel >= 100) chargeLevel = 0;
          ganTemp = 42 + Math.sin(Date.now() / 3000) * 8;
          systemStatus = chargeLevel > 85 ? 'READY' : chargeLevel > 8 ? 'CHARGING' : 'STANDBY';
        } else if (mode === 'exploded') {
          chargeLevel = 65;
          ganTemp = 42;
          systemStatus = 'STANDBY';
        }

        // Add micro-jitter to realistic values
        const chargeVoltage = chargeLevel * 4.2 + (Math.random() - 0.5) * 0.3;
        const pulseEnergy = chargeLevel * 0.85 + (Math.random() - 0.5) * 0.1;
        const coolingFlow = ganTemp > 50 ? 2.4 + (Math.random() - 0.5) * 0.2 : 0.8;
        const beamAzimuth = (prev.beamAzimuth + 2.8) % 360;
        const beamElevation = 2.7 + Math.sin(Date.now() / 4000) * 1.5;

        // Update temperature sparkline
        const newSparkline = [...prev.ganTempSparkline.slice(1), ganTemp];

        return {
          chargeLevel,
          chargeVoltage,
          pulseEnergy,
          ganTemp,
          ganTempSparkline: newSparkline,
          coolingFlow,
          beamAzimuth,
          beamElevation,
          targetRange,
          systemStatus,
          isPulsing,
        };
      });
    }, 80);

    return () => clearInterval(interval);
  }, [mode]);

  return telemetry;
}
