/**
 * useAnimationMixer Hook
 * Manages Three.js AnimationMixer for playing animation clips
 */

import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useConfiguratorStore } from '../store/configurator.store';

export function useAnimationMixer() {
  const { scene, animations, currentAnimationId, animationSpeed } = useConfiguratorStore();
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const currentActionRef = useRef<THREE.AnimationAction | null>(null);

  // Initialize mixer when scene changes
  useEffect(() => {
    if (!scene) {
      mixerRef.current = null;
      currentActionRef.current = null;
      return;
    }

    // Create new mixer for the scene
    mixerRef.current = new THREE.AnimationMixer(scene);

    return () => {
      if (mixerRef.current) {
        mixerRef.current.stopAllAction();
        mixerRef.current = null;
      }
      currentActionRef.current = null;
    };
  }, [scene]);

  // Play animation when current animation changes
  useEffect(() => {
    if (!mixerRef.current || !currentAnimationId || animations.length === 0) {
      return;
    }

    const animation = animations.find((a) => a.id === currentAnimationId);
    if (!animation) {
      return;
    }

    // Stop current action
    if (currentActionRef.current) {
      currentActionRef.current.fadeOut(0.5);
    }

    // Play new action
    const action = mixerRef.current.clipAction(animation.clip);
    action.reset();
    action.fadeIn(0.5);
    action.play();
    currentActionRef.current = action;

    return () => {
      if (currentActionRef.current) {
        currentActionRef.current.fadeOut(0.5);
      }
    };
  }, [currentAnimationId, animations]);

  // Update animation speed
  useEffect(() => {
    if (currentActionRef.current) {
      currentActionRef.current.timeScale = animationSpeed;
    }
  }, [animationSpeed]);

  // Update mixer on each frame
  useFrame((_, delta) => {
    if (mixerRef.current) {
      mixerRef.current.update(delta);
    }
  });

  return mixerRef.current;
}
