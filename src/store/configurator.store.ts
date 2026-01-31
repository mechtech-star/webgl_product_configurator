import { create } from 'zustand';
import * as THREE from 'three';
import type { ConfigMesh } from '../types/ConfigMesh';
import type { ConfigMaterial } from '../types/ConfigMaterial';

export interface ConfiguratorState {
  // Data
  modelUrl: string | null;
  modelName: string;
  scene: THREE.Group | null;
  meshes: ConfigMesh[];
  materials: ConfigMaterial[];
  isLoading: boolean;

  // Actions
  setModelUrl: (url: string, name: string) => void;
  setScene: (scene: THREE.Group) => void;
  addMesh: (mesh: ConfigMesh) => void;
  addMaterial: (material: ConfigMaterial) => void;
  setMeshes: (meshes: ConfigMesh[]) => void;
  setMaterials: (materials: ConfigMaterial[]) => void;
  setIsLoading: (loading: boolean) => void;
  toggleMeshVisibility: (meshId: string) => void;
  setMaterialColor: (materialId: string, color: string) => void;
  reset: () => void;
}

export const useConfiguratorStore = create<ConfiguratorState>((set) => ({
  // Initial state
  modelUrl: null,
  modelName: '',
  scene: null,
  meshes: [],
  materials: [],
  isLoading: false,

  // Actions
  setModelUrl: (url, name) =>
    set({
      modelUrl: url,
      modelName: name,
    }),

  setScene: (scene) =>
    set({
      scene,
    }),

  addMesh: (mesh) =>
    set((state) => ({
      meshes: [...state.meshes, mesh],
    })),

  addMaterial: (material) =>
    set((state) => ({
      materials: [...state.materials, material],
    })),

  setMeshes: (meshes) =>
    set({
      meshes,
    }),

  setMaterials: (materials) =>
    set({
      materials,
    }),

  setIsLoading: (loading) =>
    set({
      isLoading: loading,
    }),

  toggleMeshVisibility: (meshId) =>
    set((state) => ({
      meshes: state.meshes.map((mesh) =>
        mesh.id === meshId ? { ...mesh, visible: !mesh.visible } : mesh,
      ),
    })),

  setMaterialColor: (materialId, color) =>
    set((state) => {
      const material = state.materials.find((m) => m.id === materialId);
      if (material && material.ref instanceof THREE.MeshStandardMaterial) {
        material.ref.color.set(color);
      }
      return {
        materials: state.materials.map((m) =>
          m.id === materialId ? { ...m, color } : m,
        ),
      };
    }),

  reset: () =>
    set({
      modelUrl: null,
      modelName: '',
      scene: null,
      meshes: [],
      materials: [],
      isLoading: false,
    }),
}));
