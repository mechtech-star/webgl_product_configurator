# State Management & Data Flow

## Overview

The WebGL Product Configurator uses **Zustand** for global state management. All application state flows through a single store, ensuring predictability and easy debugging.

## Store Location

[src/store/configurator.store.ts](src/store/configurator.store.ts)

## Complete State Shape

```typescript
interface ConfiguratorState {
  // ===== DATA =====
  
  // Model URL (Object URL pointing to GLB blob)
  modelUrl: string | null;
  
  // Model name extracted from uploaded file
  modelName: string;
  
  // Three.js scene graph root
  scene: THREE.Group | null;
  
  // Array of meshes with visibility and material mapping
  meshes: ConfigMesh[];
  
  // Array of materials with color tracking
  materials: ConfigMaterial[];
  
  // Loading indicator during file processing
  isLoading: boolean;

  // ===== ACTIONS =====
  
  // Set loaded model URL and name
  setModelUrl: (url: string, name: string) => void;
  
  // Set scene reference
  setScene: (scene: THREE.Group) => void;
  
  // Add single mesh
  addMesh: (mesh: ConfigMesh) => void;
  
  // Add single material
  addMaterial: (material: ConfigMaterial) => void;
  
  // Bulk set all meshes
  setMeshes: (meshes: ConfigMesh[]) => void;
  
  // Bulk set all materials
  setMaterials: (materials: ConfigMaterial[]) => void;
  
  // Set loading state
  setIsLoading: (loading: boolean) => void;
  
  // Toggle mesh visibility (mutates mesh.ref.visible)
  toggleMeshVisibility: (meshId: string) => void;
  
  // Change material color (updates store + Three.js)
  setMaterialColor: (materialId: string, color: string) => void;
  
  // Clear all state
  reset: () => void;
}
```

## Data Flow Diagrams

### File Upload Flow

```
User selects file
        ↓
FileUploader component
        ↓
LoaderService.loadModelFromFile()
        ├─ FileService.readAsArrayBuffer()
        ├─ ConverterService (if needed)
        │  └─ FBXLoader / OBJLoader / etc.
        ├─ GLTFExporter
        └─ CacheService.set()
        ↓
store.setModelUrl()  ← Zustand action
        ↓
useConfiguratorScene hook triggers
        ├─ LoaderService.loadGlb()
        ├─ ModelParser.parse()
        ├─ store.setScene()
        ├─ store.setMeshes()
        ├─ store.setMaterials()
        └─ camera.fitToObjects()
        ↓
Components re-render (UI + Canvas)
```

### Mesh Visibility Toggle Flow

```
User clicks eye icon
        ↓
VisibilityToggle component
        ↓
store.toggleMeshVisibility(meshId)  ← Zustand action
        ├─ Update store state
        └─ mesh.ref.visible = !mesh.ref.visible  ← Direct Three.js mutation
        ↓
useConfiguratorScene hook listens to meshes
        ↓
mesh.ref.visible synced with Three.js renderer
        ↓
Canvas updates (no React render needed)
```

### Material Color Change Flow

```
User selects color
        ↓
ColorControl component
        ↓
store.setMaterialColor(materialId, '#ff0000')  ← Zustand action
        ├─ Update store state with new color
        └─ material.ref.color.set(color)  ← Direct Three.js mutation
        ↓
UI shows new color value
        ↓
Canvas updates (no React render needed)
```

## Store Hooks Usage

### Reading State

```typescript
import { useConfiguratorStore } from '@/store/configurator.store';

function MyComponent() {
  const store = useConfiguratorStore();
  
  // Access state (causes component re-render on change)
  const meshes = store.meshes;
  const materials = store.materials;
  const isLoading = store.isLoading;
  
  return <div>{meshes.length} meshes</div>;
}
```

### Selective State Access

Use selectors to prevent unnecessary re-renders:

```typescript
function MyComponent() {
  // Only re-render if meshes length changes
  const meshCount = useConfiguratorStore(state => state.meshes.length);
  
  // Only re-render if isLoading changes
  const isLoading = useConfiguratorStore(state => state.isLoading);
  
  return <div>Loading: {isLoading}</div>;
}
```

### Dispatching Actions

```typescript
function MyComponent() {
  const toggleVisibility = useConfiguratorStore(state => state.toggleMeshVisibility);
  const setColor = useConfiguratorStore(state => state.setMaterialColor);
  
  return (
    <button onClick={() => toggleVisibility('mesh-123')}>
      Toggle
    </button>
  );
}
```

## Three.js Reference Management

### Direct Mutations (No React Overhead)

The store keeps references to Three.js objects. When state updates, we mutate the objects directly:

```typescript
// Toggle visibility
toggleMeshVisibility: (meshId: string) => {
  const mesh = state.meshes.find(m => m.id === meshId);
  mesh.ref.visible = !mesh.ref.visible;  // Direct mutation
}

// Change color
setMaterialColor: (materialId: string, color: string) => {
  const material = state.materials.find(m => m.id === materialId);
  material.ref.color.set(color);  // Direct mutation
}
```

### Why Direct Mutations?

✅ **No React re-renders**: Canvas updates independently  
✅ **Instant feedback**: No state sync delay  
✅ **Memory efficient**: Reuse existing objects  
✅ **Performance**: Hundreds of meshes, no slowdown  

## Scene Initialization Sequence

```
1. App.tsx renders CanvasRoot
                ↓
2. CanvasRoot creates React Three Fiber Canvas
                ↓
3. SceneSetup runs
   ├─ Create lights (ambient + directional)
   ├─ Create OrbitControls
   └─ Attach to camera
                ↓
4. ModelLoader renders
   └─ Calls useConfiguratorScene hook
                ↓
5. Hook subscribes to store.modelUrl
                ↓
6. When modelUrl changes:
   ├─ Call LoaderService.loadGlb(url)
   ├─ Parse scene with ModelParser
   ├─ Extract meshes & materials
   ├─ Store in Zustand
   ├─ Add to Three.js scene
   └─ Fit camera
                ↓
7. Components render based on store state
   ├─ Inspector shows mesh/material lists
   ├─ ColorControl renders color pickers
   └─ VisibilityToggle renders eye icons
```

## State Persistence

Currently, state is **not persisted** (cleared on page refresh). To add persistence:

### Option 1: LocalStorage with Zustand Middleware

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useConfiguratorStore = create(
  persist(
    (set) => ({
      // ... store definition
    }),
    {
      name: 'configurator-storage',
      partialize: (state) => ({
        // Only persist colors and visibility
        meshes: state.meshes.map(m => ({ id: m.id, visible: m.visible })),
        materials: state.materials.map(m => ({ id: m.id, color: m.color })),
      }),
    }
  )
);
```

### Option 2: IndexedDB for Large Models

```typescript
import Dexie from 'dexie';

const db = new Dexie('ConfiguratorDB');
db.version(1).stores({
  models: '++id, name',
  meshes: '++id, modelId',
  materials: '++id, modelId',
});

// Save configuration
await db.models.add({
  name: 'My Config',
  modelUrl: store.modelUrl,
  meshes: store.meshes,
  materials: store.materials,
});

// Load configuration
const config = await db.models.get(1);
store.setMeshes(config.meshes);
store.setMaterials(config.materials);
```

## Debugging State

### DevTools Integration

```typescript
// Add to store creation for logging
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export const useConfiguratorStore = create(
  devtools((set) => ({
    // ... store definition
  }), { name: 'ConfiguratorStore' })
);
```

### Manual Inspection

```typescript
// In browser console
import { useConfiguratorStore } from '@/store/configurator.store';

const store = useConfiguratorStore.getState();
console.log('All state:', store);
console.log('Meshes:', store.meshes);
console.log('Materials:', store.materials);
console.log('Scene:', store.scene);

// Trigger actions manually
store.toggleMeshVisibility('mesh-id');
store.setMaterialColor('material-id', '#ff0000');
```

## Performance Considerations

### State Update Frequency

- **Mesh visibility**: Per-click (minimal)
- **Material color**: Per-color-change (instant)
- **Model load**: Once per file upload
- **Scene ref**: Once per model parse

### Re-render Optimization

Components only re-render when their specific state slice changes:

```typescript
// This component only re-renders when meshes array changes
function MeshList() {
  const meshes = useConfiguratorStore(state => state.meshes);
  return <div>{meshes.length}</div>;
}

// This component only re-renders when materials array changes
function MaterialList() {
  const materials = useConfiguratorStore(state => state.materials);
  return <div>{materials.length}</div>;
}
```

## Common Patterns

### Show Loading Indicator

```typescript
function App() {
  const isLoading = useConfiguratorStore(state => state.isLoading);
  
  return (
    <>
      {isLoading && <Spinner />}
      {/* ... rest of UI */}
    </>
  );
}
```

### Disable Controls While Loading

```typescript
function FileUploader() {
  const isLoading = useConfiguratorStore(state => state.isLoading);
  
  return (
    <Button disabled={isLoading}>
      {isLoading ? 'Processing...' : 'Upload'}
    </Button>
  );
}
```

### Show/Hide Based on Model State

```typescript
function Inspector() {
  const hasModel = useConfiguratorStore(state => state.modelUrl !== null);
  
  return (
    <div>
      {hasModel ? (
        <MeshPanel />
      ) : (
        <p>Upload a model to get started</p>
      )}
    </div>
  );
}
```

## Future State Extensions

Potential additions to the state shape:

```typescript
interface ConfiguratorStateExtended extends ConfiguratorState {
  // Presets/variants
  presets: ConfigPreset[];
  activePresetId: string | null;
  
  // Undo/redo
  undoStack: ConfiguratorState[];
  redoStack: ConfiguratorState[];
  
  // Animations
  animations: THREE.AnimationClip[];
  activeAnimationId: string | null;
  
  // Selection
  selectedMeshId: string | null;
  selectedMaterialId: string | null;
  
  // Camera
  cameraPosition: Vector3;
  cameraTarget: Vector3;
}
```

## State Comparison

| Feature | Zustand | Redux | Context |
|---------|---------|-------|---------|
| Bundle Size | ~1KB | ~10KB | Integrated |
| Learning Curve | Gentle | Steep | Medium |
| TypeScript | Excellent | Good | Good |
| DevTools | Yes | Excellent | No |
| Middleware | Yes | Yes | No |
| Performance | Excellent | Good | Fair |

**Why Zustand?** Simple, performant, and perfect for mid-scale applications like this configurator.

---

See [ARCHITECTURE.md](./ARCHITECTURE.md) for more details on the overall system design.
