import * as THREE from 'three';

export interface ConfigModel {
  id: string;
  name: string;
  url: string;
  scene: THREE.Group;
  meshCount: number;
  materialCount: number;
}
