# WebGL Product Configurator

A production-ready, client-side WebGL 3D product configurator built with React, Three.js, and React Three Fiber.

## Architecture Overview

### Core Principles

- **Client-Only**: All processing happens in the browser - no backend required
- **Unified Pipeline**: All 3D formats converted to GLB for consistent handling
- **State-Driven**: Zustand manages all application state
- **React Three Fiber**: Single canvas with modular Three.js logic
- **Type-Safe**: Full TypeScript implementation with strict mode

### Folder Structure

```
src/
├── app/
│   └── App.tsx                  # Main application layout
│
├── components/
│   ├── ui/                      # shadcn components (button, card, etc.)
│   ├── layout/
│   │   ├── TopBar.tsx          # Navigation and file upload trigger
│   │   ├── Sidebar.tsx         # Left panel with file uploader
│   │   ├── Inspector.tsx       # Right panel with model controls
│   │   └── Viewport.tsx        # 3D canvas container
│   └── configurator/
│       ├── FileUploader.tsx    # Drag-drop file upload
│       ├── MeshPanel.tsx       # Mesh visibility controls
│       ├── MaterialPanel.tsx   # Material color picker
│       ├── ColorControl.tsx    # Individual color picker
│       └── VisibilityToggle.tsx # Per-mesh visibility button
│
├── three/
│   ├── CanvasRoot.tsx          # React Three Fiber canvas setup
│   ├── SceneSetup.tsx          # Lights, environment, controls
│   ├── ModelLoader.tsx         # Model loading orchestration
│   ├── ModelParser.ts          # Extract meshes/materials from scene
│   ├── useConfiguratorScene.ts # Custom hook for scene lifecycle
│   └── exporters/
│       └── exportToGLB.ts      # Export modified model
│
├── store/
│   └── configurator.store.ts   # Zustand global state
│
├── services/
│   ├── file.service.ts         # File I/O and validation
│   ├── loader.service.ts       # GLB loading with GLTFLoader
│   ├── converter.service.ts    # Format conversion (FBX→GLB, OBJ→GLB, etc.)
│   └── cache.service.ts        # In-memory model cache
│
├── types/
│   ├── ConfigMesh.ts           # Mesh interface with ref
│   ├── ConfigMaterial.ts       # Material interface with ref
│   └── ConfigModel.ts          # Model metadata interface
│
├── utils/
│   └── three.utils.ts          # Common Three.js helpers
│
└── main.tsx                     # React root
```

## State Management

### Zustand Store Structure

```typescript
ConfiguratorState {
  // Data
  modelUrl: string | null              // Object URL of loaded GLB
  modelName: string                    // Extracted from file
  scene: THREE.Group | null            // Root scene group
  meshes: ConfigMesh[]                 // Array of mesh configs
  materials: ConfigMaterial[]          // Array of material configs
  isLoading: boolean                   // Loading indicator

  // Actions
  setModelUrl(url, name)               // Set loaded model
  setScene(scene)                      // Set scene reference
  setMeshes(meshes)                    // Bulk set meshes
  setMaterials(materials)              // Bulk set materials
  setIsLoading(loading)                // Loading state
  toggleMeshVisibility(meshId)         // Toggle mesh.visible
  setMaterialColor(materialId, color)  // Update material color
  reset()                              // Clear all state
}
```

### Key Interfaces

#### ConfigMesh
```typescript
{
  id: string                 // Unique identifier
  name: string              // Mesh name from model
  visible: boolean          // Current visibility state
  materialId: string        // Primary material reference
  ref: THREE.Mesh           // Direct Three.js reference
}
```

#### ConfigMaterial
```typescript
{
  id: string                // Unique identifier
  name: string             // Material name or auto-generated
  color: string            // Hex color string
  ref: THREE.Material      // Direct Three.js reference
}
```

## File Upload & Conversion Pipeline

### Supported Formats
- `.glb` - Direct load
- `.gltf` - Loaded as-is (binary)
- `.fbx` - Converted via FBXLoader + GLTFExporter
- `.obj` + `.mtl` - Converted via OBJLoader + GLTFExporter

### Conversion Process

1. **Load File**: Read as ArrayBuffer
2. **Detect Format**: Check file extension
3. **Convert** (if needed):
   - Create Three.js loader
   - Parse file into THREE.Group
   - Export using GLTFExporter
   - Get binary GLB data
4. **Create URL**: Blob + ObjectURL
5. **Cache**: Store in memory cache
6. **Load**: Pass URL to GLTFLoader
7. **Parse**: Extract meshes and materials
8. **Store**: Save references in Zustand

### Cache Service
- Max size: 500MB
- LRU eviction on overflow
- Automatic cleanup with ObjectURL revocation

## Three.js Integration

### Canvas Architecture

```
CanvasRoot (React Three Fiber)
├── SceneSetup
│   ├── Lights (ambient + directional)
│   ├── OrbitControls
│   └── Shadows
└── ModelLoader
    └── useConfiguratorScene (hook)
        ├── Load GLB from store URL
        ├── Parse scene
        ├── Fit camera
        └── Update store
```

### Key Features

- **OrbitControls**: Pan, rotate, zoom model
- **Auto-fit Camera**: Calculated from bounding box
- **Mutation via Refs**: No React re-renders on updates
- **Visibility Toggling**: Direct `mesh.visible` mutation
- **Color Updates**: Direct `material.color.set()` mutation

### Performance Optimizations

- Single canvas (no re-creation)
- Direct Three.js ref mutations (no React render cycles)
- Geometry/material disposal on reset
- Lazy mesh extraction on load

## UI/UX Flow

### Empty State
```
┌─────────────────────────┐
│      Top Bar            │
│  (Upload Model, Reset)  │
├─────────────────────────┤
│                         │
│   Centered Upload Area  │
│  Drag & drop, Button    │
│                         │
└─────────────────────────┘
```

### Loaded State
```
┌─────────────────────────┐
│      Top Bar            │
│  (Controls visible)     │
├──────┬──────────┬───────┤
│      │          │       │
│ Left │ Viewport │ Right │
│Panel │          │       │
│ File │  Canvas  │ Model │
│  Up  │   3D     │ Info  │
│      │  Model   │ Mesh  │
│      │          │ Mater │
│      │          │       │
└──────┴──────────┴───────┘
```

### Controls

| Feature | Interaction |
|---------|-------------|
| Upload | Drag-drop or button in sidebar |
| Pan | Middle mouse drag |
| Rotate | Left mouse drag |
| Zoom | Mouse wheel |
| Mesh Hide/Show | Eye icon in mesh list |
| Change Color | Color picker in materials list |
| Export | Download button in top bar |
| Reset | Reset button in top bar |
| Fit Camera | Maximize button in top bar |

## Usage

### Development

```bash
npm install --legacy-peer-deps
npm run dev
```

Visit `http://localhost:5173`

### Production Build

```bash
npm run build
npm run preview
```

## File Upload Example

### JavaScript/TypeScript Integration

```typescript
import { useConfiguratorStore } from '@/store/configurator.store';
import { LoaderService } from '@/services/loader.service';

function MyComponent() {
  const store = useConfiguratorStore();

  async function handleFileUpload(file: File) {
    try {
      // Load and convert
      const url = await LoaderService.loadModelFromFile(file);
      
      // Update store
      store.setModelUrl(url, file.name.split('.')[0]);
      
      // UI automatically updates via store subscription
    } catch (error) {
      console.error('Upload failed:', error);
    }
  }

  return (
    <input
      type="file"
      accept=".glb,.gltf,.fbx,.obj"
      onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
    />
  );
}
```

### Programmatic Model Control

```typescript
const store = useConfiguratorStore();

// Toggle mesh visibility
store.toggleMeshVisibility('mesh-id-123');

// Change material color
store.setMaterialColor('material-id-456', '#ff0000');

// Get current state
console.log(store.meshes);        // All meshes with visibility
console.log(store.materials);     // All materials with colors

// Reset everything
store.reset();
```

## Customization Guide

### Adding New File Format Support

1. Create loader in `services/converter.service.ts`:
```typescript
static async myFormatToGlb(arrayBuffer: ArrayBuffer): Promise<ArrayBuffer> {
  const loader = new MyFormatLoader();
  const model = await loader.parse(arrayBuffer);
  return this.sceneToGlb(model);
}
```

2. Update `LoaderService.loadModelFromFile()`:
```typescript
else if (ext === '.myformat') {
  glbBuffer = await ConverterService.myFormatToGlb(arrayBuffer);
}
```

### Extending Material Types

The system currently supports `MeshStandardMaterial`, `MeshPhongMaterial`, and `MeshBasicMaterial`. To add support for custom materials:

1. Update `ModelParser.extractColor()`:
```typescript
else if (material instanceof MyCustomMaterial) {
  return ThreeUtils.colorToHex(material.customColorProperty);
}
```

2. Update store's `setMaterialColor()` to handle your material type.

### Custom UI Controls

Add new configurator controls in `components/configurator/`:

```typescript
export function MyNewControl() {
  const store = useConfiguratorStore();

  return (
    <div>
      <button onClick={() => store.setMaterialColor(materialId, newColor)}>
        Apply
      </button>
    </div>
  );
}
```

Then add to `Inspector.tsx` accordion.

## Future Extensions

The architecture supports:

- **Presets**: Save/load model configurations
- **Animation**: Support for skeletal animation and morphTargets
- **WebXR**: VR/AR viewing modes
- **Offline**: Service workers + IndexedDB persistence
- **Collaboration**: Real-time model sharing (with backend)
- **Streaming**: Progressive model loading for large files
- **Variants**: Multiple LOD models per product
- **Physics**: Collider visualization and interaction

## Performance Considerations

### Current Optimizations
- Single Three.js canvas
- Direct object mutation (no React overhead)
- In-memory caching with LRU eviction
- Efficient scene traversal on load
- Material reuse across meshes

### For Large Models (>100MB)
- Implement chunked loading
- Use progressive GLB streaming
- Add LOD (Level of Detail) support
- Consider web workers for conversion

### Browser Compatibility
- Modern browsers with WebGL 2.0
- Tested on Chrome, Firefox, Safari, Edge
- Requires ES2022 support

## Dependencies

### Core
- `react@^19.2.0`
- `react-dom@^19.2.0`
- `three@^0.156.0`
- `@react-three/fiber@^9.5.0`
- `zustand@^4.5.0`

### UI
- `shadcn` (Button, Card, Input, etc.)
- `tailwindcss@^4.1.17`
- `lucide-react@^0.563.0`

### Three.js Addons
- Three.js examples (OrbitControls, loaders, exporters)

## Troubleshooting

### Model Not Loading
1. Check file format is supported
2. Verify file is not corrupted
3. Check browser console for errors
4. Try another file to isolate issue

### Colors Not Updating
1. Ensure material has `color` property
2. Check material is `MeshStandardMaterial` or compatible
3. Verify in console: `store.materials[0].ref.color`

### Low Performance
1. Check model file size (limit ~50MB for smooth interaction)
2. Monitor GPU usage in DevTools
3. Check for multiple canvas instances (shouldn't happen)
4. Try simpler models to verify

## License

Production-ready implementation - customize and extend as needed.
