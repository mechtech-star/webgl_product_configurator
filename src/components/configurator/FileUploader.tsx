/**
 * File Uploader Component
 * Handles drag-drop and file selection
 */

import { useState, useRef } from 'react';
import { useConfiguratorStore } from '../../store/configurator.store';
import { LoaderService } from '../../services/loader.service';
import { FileService } from '../../services/file.service';
import { Cloud, Upload } from 'lucide-react';
import { Button } from '../ui/button';

export function FileUploader() {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const store = useConfiguratorStore();

  const handleFile = async (file: File) => {
    if (!FileService.isSupportedFormat(file)) {
      alert('Unsupported file format. Please upload .glb, .gltf, .fbx, or .obj');
      return;
    }

    try {
      store.setIsLoading(true);
      const url = await LoaderService.loadModelFromFile(file);
      store.setModelUrl(url, file.name.split('.')[0]);
    } catch (error) {
      console.error('Failed to load model:', error);
      alert('Failed to load model. See console for details.');
      store.setIsLoading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  return (
    <div className="flex justify-center">
      <div
        className={`flex flex-col items-center justify-center p-8 rounded-lg border-2 border-dashed transition max-w-sm w-full ${
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-border bg-muted/50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
      <Cloud className="w-12 h-12 text-muted-foreground mb-4" />

      <h3 className="text-lg font-semibold text-foreground mb-2">
        Upload 3D Model
      </h3>

      <p className="text-sm text-muted-foreground mb-4 text-center">
        Drag and drop your model file here or click to browse
      </p>

      <p className="text-xs text-muted-foreground mb-4">
        Supported formats: .glb, .gltf, .fbx, .obj
      </p>

      <Button
        onClick={() => fileInputRef.current?.click()}
        disabled={store.isLoading}
        variant="outline"
        className="flex items-center gap-2"
      >
        <Upload className="w-4 h-4" />
        {store.isLoading ? 'Processing...' : 'Select File'}
      </Button>

      <input
        ref={fileInputRef}
        type="file"
        accept=".glb,.gltf,.fbx,.obj"
        onChange={handleInputChange}
        className="hidden"
        disabled={store.isLoading}
      />
      </div>
    </div>
  );
}
