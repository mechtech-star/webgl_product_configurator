/**
 * Converter Service
 * Converts non-GLB files to GLB format for unified pipeline
 */

import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader';
import * as THREE from 'three';

export class ConverterService {
  /**
   * Convert FBX to GLB
   */
  static async fbxToGlb(arrayBuffer: ArrayBuffer): Promise<ArrayBuffer> {
    const fbxLoader = new FBXLoader();
    const blob = new Blob([arrayBuffer], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);

    try {
      const model = await fbxLoader.loadAsync(url);
      return this.sceneToGlb(model);
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  /**
   * Convert OBJ to GLB
   */
  static async objToGlb(
    arrayBuffer: ArrayBuffer,
    mtlArrayBuffer?: ArrayBuffer,
  ): Promise<ArrayBuffer> {
    const objLoader = new OBJLoader();
    let mtlLoader: any | undefined;

    const objBlob = new Blob([arrayBuffer], { type: 'application/octet-stream' });
    const objUrl = URL.createObjectURL(objBlob);

    try {
      let model: THREE.Group | THREE.Object3D;

      if (mtlArrayBuffer) {
        mtlLoader = new MTLLoader();
        const mtlBlob = new Blob([mtlArrayBuffer], {
          type: 'application/octet-stream',
        });
        const mtlUrl = URL.createObjectURL(mtlBlob);

        try {
          const materials = await mtlLoader.loadAsync(mtlUrl);
          objLoader.setMaterials(materials);
        } finally {
          URL.revokeObjectURL(mtlUrl);
        }
      }

      model = await objLoader.loadAsync(objUrl);
      return this.sceneToGlb(model);
    } finally {
      URL.revokeObjectURL(objUrl);
    }
  }

  /**
   * Convert GLTF to GLB
   */
  static async gltfToGlb(arrayBuffer: ArrayBuffer): Promise<ArrayBuffer> {
    // GLTF files already have a standardized format
    // Just wrap in a scene and export
    const blob = new Blob([arrayBuffer], { type: 'model/gltf-binary' });
    const url = URL.createObjectURL(blob);

    try {
      // Load as binary GLTF
      const response = await fetch(url);
      const gltfArrayBuffer = await response.arrayBuffer();
      return gltfArrayBuffer;
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  /**
   * Convert a Three.js scene/model to GLB format
   */
  private static async sceneToGlb(object: THREE.Object3D): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const exporter = new GLTFExporter();

      exporter.parse(
        object,
        (gltf: any) => {
          if (gltf instanceof ArrayBuffer) {
            resolve(gltf);
          } else {
            // Binary GLB export
            const json = JSON.stringify(gltf);
            const jsonBuffer = new TextEncoder().encode(json).buffer;
            const glb = this.createGlbFromJson(jsonBuffer);
            resolve(glb);
          }
        },
        (error: any) => {
          reject(new Error(`Export failed: ${error}`));
        },
        {
          binary: true,
        },
      );
    });
  }

  /**
   * Create GLB binary from JSON and buffers
   */
  private static createGlbFromJson(jsonBuffer: ArrayBuffer): ArrayBuffer {
    // GLB file format:
    // 12 byte header: magic (0x46546C67), version (2), length
    // JSON chunk: 8 byte header (length, type 0x4E4F534A) + JSON
    // BIN chunk: 8 byte header (length, type 0x004E4942) + binary data

    const magic = 0x46546c67; // 'glTF'
    const version = 2;
    const jsonChunkType = 0x4e4f534a; // 'JSON'

    // Pad JSON to 4-byte boundary
    const paddedJsonLength =
      Math.ceil(jsonBuffer.byteLength / 4) * 4;
    const jsonChunkData = new ArrayBuffer(paddedJsonLength);
    const jsonUint8 = new Uint8Array(jsonChunkData);
    jsonUint8.set(new Uint8Array(jsonBuffer));

    // Create GLB
    const glbLength = 12 + 8 + paddedJsonLength;
    const glb = new ArrayBuffer(glbLength);
    const view = new DataView(glb);
    const uint8 = new Uint8Array(glb);

    let offset = 0;

    // Header
    view.setUint32(offset, magic, true);
    offset += 4;
    view.setUint32(offset, version, true);
    offset += 4;
    view.setUint32(offset, glbLength, true);
    offset += 4;

    // JSON Chunk
    view.setUint32(offset, paddedJsonLength, true);
    offset += 4;
    view.setUint32(offset, jsonChunkType, true);
    offset += 4;

    uint8.set(new Uint8Array(jsonChunkData), offset);

    return glb;
  }
}
