import * as THREE from 'three';

export interface ConfigMaterial {
  id: string;
  name: string;
  color: string;
  ref: THREE.Material;
}
