# Copilot Instructions for WebGL Product Configurator

## Project Overview

**WebGL Product Configurator** is a client-side 3D model viewer and editor built with React, Three.js, and React Three Fiber. It supports multiple 3D formats (GLB, GLTF, FBX, OBJ) with real-time mesh visibility and material color editing. All processing happens in the browser—no backend required.

## Architecture Essentials

### High-Level Data Flow

```
File Upload → Format Detection → Format Conversion (if needed) → GLB Creation
    ↓
Store URL in Zustand → useConfiguratorScene Hook Triggers
    ↓
Load GLB via GLTFLoader → Parse Meshes/Materials/Animations
    ↓
Store References in Zustand → React Components Render UI
    ↓
User Interacts (visibility/color) → Mutate Three.js Refs + Zustand → Canvas Updates
    ↓
Export via GLTFExporter → Download GLB with All Changes
```

### Key Architectural Decisions

- **Unified GLB Pipeline**: All formats (FBX, OBJ, GLTF) are converted to GLB before loading. This ensures consistent handling and caching.
- **Direct Three.js References in State**: `ConfigMesh.ref` and `ConfigMaterial.ref` hold direct Three.js objects. Mutations to `ref.visible` and `ref.color` immediately update the canvas without re-renders.
- **Zustand for Global State**: All model metadata (`meshes`, `materials`, `animations`) lives in Zustand. Components connect via `useConfiguratorStore()`.
- **React Three Fiber (R3F) Canvas**: Single canvas orchestrated via `CanvasRoot.tsx` → `SceneSetup.tsx` → `ModelLoader.tsx`. Scene state synced with Zustand via `useConfiguratorScene` hook.

### Core Folders & Responsibilities

| Folder | Purpose |
|--------|---------|
| `src/store/` | Zustand store with all model state and actions |
| `src/three/` | React Three Fiber components, scene setup, model parsing |
| `src/services/` | File I/O, format conversion, GLB loading, in-memory caching |
| `src/components/configurator/` | UI controls (FileUploader, MeshPanel, MaterialPanel, ColorControl, etc.) |
| `src/components/layout/` | Top-level page layout (TopBar, Sidebar, Inspector, Viewport) |
| `src/types/` | TypeScript interfaces: `ConfigMesh`, `ConfigMaterial`, `ConfigModel`, `AnimationClip` |
| `src/utils/` | Three.js helpers (`ThreeUtils.ts`), texture utilities |

## State Management Pattern

### Store Location: [src/store/configurator.store.ts](src/store/configurator.store.ts)

The Zustand store is the single source of truth. Key state shape:

```typescript
{
  modelUrl: string | null           // Object URL pointing to GLB blob
  scene: THREE.Group | null         // Root scene graph (set by useConfiguratorScene)
  meshes: ConfigMesh[]              // Array with visibility + refs
  materials: ConfigMaterial[]       // Array with color + refs + texture detection
  animations: AnimationClip[]       // Loaded animations from model
  currentAnimationId: string | null // Selected animation
  isLoading: boolean                // File processing indicator
}
```

### Key Actions Pattern

- **Setters are simple**: `setMeshes()`, `setMaterials()` replace entire arrays. Use Zustand's `set()` directly when adding single items.
- **Mutation actions**: `toggleMeshVisibility(meshId)` modifies `store.meshes` AND mutates `mesh.ref.visible` in Three.js simultaneously.
- **Color updates**: `setMaterialColor(materialId, color)` updates Zustand AND mutates `material.ref.color` (Three.js) in one action.
- **Reset clears all state**: `reset()` clears model, meshes, materials, animations. Used on "Reset" button click.

### Adding New State

**Always store reference objects** (`THREE.Mesh`, `THREE.Material`) in config objects so mutations propagate immediately:

```typescript
// ✅ Good: Direct Three.js ref allows immediate visual updates
const configMesh = {
  id: 'mesh-1',
  ref: threeJsMeshInstance,  // Direct reference
  visible: true,
  // ... other props
};

// ❌ Avoid: Duplicating Three.js properties defeats the purpose
const configMesh = {
  id: 'mesh-1',
  position: mesh.position.toArray(),  // Stale copy!
};
```

## File Format Pipeline

### Supported Formats

| Format | Extension | Handler | Output |
|--------|-----------|---------|--------|
| GLB | `.glb` | Direct GLTFLoader | Used as-is |
| GLTF (Binary) | `.gltf` | GLTFLoader + bin check | Loaded as-is |
| FBX | `.fbx` | FBXLoader → GLTFExporter | Converted to GLB |
| OBJ | `.obj` | OBJLoader + MTLLoader → GLTFExporter | Converted to GLB |

### Conversion Flow (for FBX/OBJ)

1. Load format-specific loader (FBXLoader, OBJLoader)
2. Parse file → THREE.Group
3. Export via GLTFExporter → Binary GLB
4. Create Blob + ObjectURL
5. Cache in memory
6. Load via standard GLTFLoader

**Location**: [src/services/converter.service.ts](src/services/converter.service.ts)

## Component Patterns

### UI Component Hierarchy

```
Viewport (canvas container)
  └─ CanvasRoot (React Three Fiber Canvas)
      ├─ SceneSetup (lights, controls, environment)
      ├─ ModelLoader (orchestrates loading)
      └─ useConfiguratorScene hook (syncs store ↔ Three.js)

Sidebar (left panel)
  └─ FileUploader (drag-drop, multi-step for GLTF)

Inspector (right panel)
  ├─ ModelInfo
  ├─ MeshPanel (visibility toggles)
  ├─ MaterialPanel (color pickers)
  ├─ AnimationPanel (animation playback)
  └─ TextureMapIndicator (texture detection UI)
```

### Adding New Controls

**Example: Add a mesh rotation control**

1. Add action to Zustand store:
```typescript
setMeshRotation: (meshId: string, rotation: THREE.Euler) => {
  const mesh = store.meshes.find(m => m.id === meshId);
  if (mesh) mesh.ref.rotation.copy(rotation);
  // No need to update Zustand—mutation is enough
}
```

2. Create UI component in `src/components/configurator/`:
```tsx
function RotationControl({ mesh }: { mesh: ConfigMesh }) {
  const store = useConfiguratorStore();
  return (
    <Button onClick={() => {
      mesh.ref.rotation.y += Math.PI / 4;
      // Optionally trigger store update if you need to track it
    }}>
      Rotate
    </Button>
  );
}
```

3. Add to Inspector in `src/components/layout/Inspector.tsx`

### Service Injection Pattern

**Always inject services, never use global instances:**

```tsx
// ✅ Good: Pass service as dependency
async function loadFile(file: File, loaderService: LoaderService) {
  const url = await loaderService.loadModelFromFile(file);
}

// ❌ Avoid: Hidden dependencies make testing harder
async function loadFile(file: File) {
  const url = await LoaderService.loadModelFromFile(file);
}
```

## Critical Workflows

### Workflow: Load a New Model

1. **FileUploader.tsx** listens to drag-drop or file input
2. Calls `LoaderService.loadModelFromFile(file, additionalFiles)`
3. LoaderService converts format if needed → creates GLB Blob → caches it → returns ObjectURL
4. `store.setModelUrl(url, modelName)` triggers Zustand update
5. **useConfiguratorScene hook** watches `store.modelUrl`, loads GLB via GLTFLoader
6. **ModelParser** extracts meshes/materials/animations from loaded scene
7. Store updates: `setScene()`, `setMeshes()`, `setMaterials()`, `setAnimations()`
8. React components re-render with new UI, canvas displays model

### Workflow: Change Material Color

1. User clicks color picker in MaterialPanel
2. `store.setMaterialColor(materialId, hexColor)` called
3. Action mutates: `material.ref.color.setHex(hexColor)` AND updates Zustand state
4. Canvas re-renders in next frame (R3F hooks into Three.js render loop)
5. Color visible immediately

### Workflow: Export Modified Model

1. Click "Download" button in TopBar
2. `exportToGLB(store.scene)` called
3. GLTFExporter serializes current scene (includes all material color changes)
4. Generated GLB downloaded as file

**Location**: [src/three/exporters/exportToGLB.ts](src/three/exporters/exportToGLB.ts)

## Testing & Development

### Local Development

```bash
npm install --legacy-peer-deps
npm run dev
# Open http://localhost:5173
```

### Build & Lint

```bash
npm run build        # TypeScript check + Vite bundle
npm run lint         # ESLint (base-ui, react-hooks)
npm run preview      # Preview production build locally
```

### Debugging Tips

- **Redux DevTools not available**: Use Zustand's built-in logging: `create(..., { name: 'ConfiguratorStore' })`
- **Canvas not rendering**: Check `SceneSetup.tsx` for camera/light setup. Verify `ModelLoader` adds model to scene.
- **Material colors not updating**: Ensure `material.ref instanceof THREE.MeshStandardMaterial`. Other material types (Basic, Phong) may have different properties.
- **Performance issues**: Check `useConfiguratorScene` for improper memory cleanup. Use `ThreeUtils.disposeGroup()` before removing models.

## Common Pitfalls

| Issue | Root Cause | Solution |
|-------|-----------|----------|
| Canvas shows black screen | Lights or camera misconfigured | Check `SceneSetup.tsx` ambient/directional lights |
| Material color doesn't change | Material type incompatible | Verify material is `MeshStandardMaterial` before setting color |
| Memory leak on file upload | Old model not disposed | Always call `disposeGroup()` before removing scene |
| Mesh visibility toggle not working | `ref` is stale | Always use current `mesh.ref` from store state |
| Export doesn't include changes | GLTFExporter snapshot timing | Ensure all mutations complete before export |

## File Structure for New Features

**When adding a new feature:**

1. Add Zustand state/actions in `src/store/configurator.store.ts`
2. Create service methods in `src/services/` if external I/O needed
3. Create UI component in `src/components/configurator/` (feature logic)
4. Add type definitions in `src/types/` if needed
5. Integrate into layout component (`Inspector.tsx`, `TopBar.tsx`, `Sidebar.tsx`)
6. Add reference in `QUICKSTART.md` with code example

**Example**: To add a shader override feature:
- Add `shaderOverrides: Record<string, ShaderCode>` to store
- Create `src/services/shader.service.ts` for compilation
- Create `src/components/configurator/ShaderPanel.tsx` for UI
- Add `ShaderOverride` type in `src/types/`
- Integrate into `Inspector.tsx`

## Dependencies & Versions

Key packages (see [package.json](package.json)):
- **React 19.2.0** — Modern hooks, suspense
- **Three.js 0.156.0** — 3D graphics
- **React Three Fiber 9.2.3** — React integration for Three.js
- **Zustand 4.5.0** — Lightweight state management
- **Tailwind CSS 4.1.17** — Styling
- **shadcn/ui** — Pre-built components (buttons, dialogs, etc.)
- **TypeScript 5.9.3** — Type safety

## Conventions

- **Naming**: `camelCase` for variables/functions, `PascalCase` for components/classes, `UPPERCASE` for constants
- **File naming**: Component files = `PascalCase.tsx`, services = `kebab-case.service.ts`, stores = `kebab-case.store.ts`
- **Import order**: React → Third-party → Local services → Local types → Local components
- **Error handling**: Use try-catch in async functions, display errors in UI via dialogs or toast (use shadcn Alert component)
- **Comments**: Use JSDoc for public functions, explain "why" not "what" for complex logic
