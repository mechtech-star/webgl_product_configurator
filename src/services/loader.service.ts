/**
 * Loader Service
 * Handles loading and parsing of 3D model files
 */

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { FileService } from './file.service';
import { CacheService } from './cache.service';
import { ConverterService } from './converter.service';

export class LoaderService {
  private static gltfLoader = new GLTFLoader();

  /**
   * Load model from file with automatic conversion if needed
   * @returns ObjectURL pointing to GLB file
   */
  static async loadModelFromFile(file: File): Promise<string> {
    // Check cache first
    const cached = CacheService.get(file.name);
    if (cached) {
      return cached;
    }

    const ext = FileService.getFileExtension(file);
    const arrayBuffer = await FileService.readAsArrayBuffer(file);

    let glbBuffer: ArrayBuffer;

    if (ext === '.glb') {
      // Already GLB, use directly
      glbBuffer = arrayBuffer;
    } else if (ext === '.gltf') {
      // Convert GLTF to GLB
      glbBuffer = await ConverterService.gltfToGlb(arrayBuffer);
    } else if (ext === '.fbx') {
      // Convert FBX to GLB
      glbBuffer = await ConverterService.fbxToGlb(arrayBuffer);
    } else if (ext === '.obj') {
      // Try to load associated MTL file if available
      let mtlBuffer: ArrayBuffer | undefined;
      // Note: In a real scenario, you'd need to handle MTL separately
      // For now, OBJ without MTL
      glbBuffer = await ConverterService.objToGlb(arrayBuffer, mtlBuffer);
    } else {
      throw new Error(`Unsupported file format: ${ext}`);
    }

    // Create blob and URL
    const blob = FileService.arrayBufferToBlob(glbBuffer, 'model/gltf-binary');
    const objectUrl = FileService.createObjectUrl(blob);

    // Cache for future use
    CacheService.set(file.name, objectUrl, blob.size);

    return objectUrl;
  }

  /**
   * Load GLB from URL using GLTFLoader
   */
  static async loadGlb(url: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.gltfLoader.load(url, resolve, undefined, reject);
    });
  }
}
