/**
 * Canvas Root Component
 * Main Three.js canvas with Fiber setup
 */

import { Canvas } from '@react-three/fiber';
import { SceneSetup } from './SceneSetup';
import { ModelLoader } from './ModelLoader';
import { useTheme } from 'next-themes';
import { useMemo } from 'react';

interface CanvasRootProps {
  className?: string;
}

export function CanvasRoot({ className }: CanvasRootProps) {
  const { theme } = useTheme();

  const backgroundColor = useMemo(() => {
    // Use theme-aware background colors
    return theme === 'dark' ? '#252525' : '#ffffff';
  }, [theme]);

  return (
    <Canvas
      className={className}
      camera={{
        position: [0, 0, 10],
        fov: 75,
        near: 0.1,
        far: 1000,
      }}
      gl={{
        antialias: true,
        preserveDrawingBuffer: true,
      }}
    >
      {/* Scene configuration */}
      <SceneSetup />

      {/* Model loading logic */}
      <ModelLoader />

      {/* Theme-aware background */}
      <color attach="background" args={[backgroundColor]} />
    </Canvas>
  );
}
