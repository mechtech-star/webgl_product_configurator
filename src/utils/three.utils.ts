/**
 * Three.js Utilities
 * Common helpers for Three.js operations
 */

import * as THREE from 'three';

export class ThreeUtils {
  /**
   * Get default camera position for model
   */
  static getCameraPosition(
    boundingBox: THREE.Box3,
  ): { position: THREE.Vector3; lookAt: THREE.Vector3 } {
    const size = boundingBox.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = 75;
    const cameraZ = (maxDim / 2) * Math.tan((fov * Math.PI) / 2 / 180);

    const center = boundingBox.getCenter(new THREE.Vector3());
    const position = new THREE.Vector3(
      center.x + maxDim * 0.5,
      center.y + maxDim * 0.3,
      center.z + cameraZ,
    );

    return {
      position,
      lookAt: center,
    };
  }

  /**
   * Fit camera to view all objects
   */
  static fitCameraToObjects(
    camera: THREE.PerspectiveCamera,
    objects: THREE.Object3D[],
    controls?: any,
  ) {
    let boundingBox = new THREE.Box3();

    objects.forEach((obj) => {
      boundingBox.expandByObject(obj);
    });

    const size = boundingBox.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = camera.fov * (Math.PI / 180);
    let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));

    cameraZ *= 1.5; // Add some padding

    const center = boundingBox.getCenter(new THREE.Vector3());

    camera.position.set(
      center.x + maxDim * 0.3,
      center.y + maxDim * 0.3,
      center.z + cameraZ,
    );

    if (controls) {
      controls.target.copy(center);
      controls.update();
    }

    camera.lookAt(center);
  }

  /**
   * Generate unique ID
   */
  static generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Convert hex color to THREE.Color
   */
  static hexToColor(hex: string): THREE.Color {
    return new THREE.Color(hex);
  }

  /**
   * Convert THREE.Color to hex string
   */
  static colorToHex(color: THREE.Color): string {
    return '#' + color.getHexString();
  }

  /**
   * Dispose geometry and material
   */
  static disposeMesh(mesh: THREE.Mesh) {
    if (mesh.geometry) {
      mesh.geometry.dispose();
    }
    if (Array.isArray(mesh.material)) {
      mesh.material.forEach((mat: THREE.Material) => mat.dispose());
    } else if (mesh.material) {
      mesh.material.dispose();
    }
  }

  /**
   * Recursively dispose all children
   */
  static disposeGroup(group: THREE.Group) {
    group.traverse((child: THREE.Object3D) => {
      if (child instanceof THREE.Mesh) {
        this.disposeMesh(child);
      }
    });
  }
}
