# Quick Start Guide

## Installation

```bash
# Install dependencies
npm install --legacy-peer-deps

# Start development server
npm run dev
```

Then open `http://localhost:5173` in your browser.

## Using the Configurator

### 1. Upload a 3D Model

- **Drag & Drop**: Drag a `.glb`, `.gltf`, `.fbx`, or `.obj` file onto the upload area
- **Or Click**: Click the upload button and select a file

Supported formats:
- `.glb` - Binary glTF (recommended)
- `.gltf` - ASCII glTF 
- `.fbx` - Autodesk FBX
- `.obj` - Wavefront OBJ (with optional `.mtl`)

### 2. View Your Model

Once uploaded:
- **Rotate**: Click and drag with left mouse button
- **Pan**: Click and drag with middle mouse button
- **Zoom**: Scroll mouse wheel
- **Fit to View**: Click the maximize button in the top bar

### 3. Configure Your Model

#### Toggle Mesh Visibility
- Open the **Meshes** panel on the right
- Click the eye icon next to any mesh to hide/show it
- Changes apply instantly in the viewport

#### Change Material Colors
- Open the **Materials** panel on the right
- Click the color swatch next to any material
- Select a new color from the picker
- Color updates in real-time

### 4. Export Your Configuration

- Click the **Download** button in the top bar
- Your modified model is exported as a `.glb` file
- All material colors and visibility settings are preserved

### 5. Start Over

- Click the **Reset** button in the top bar
- Upload a new model to begin again

## Code Examples

### Add Custom Mesh Controls

Edit `src/components/configurator/MeshPanel.tsx`:

```typescript
<Button
  size="sm"
  variant="outline"
  onClick={() => {
    // Example: isolate this mesh
    store.meshes.forEach(m => {
      m.ref.visible = m.id === mesh.id;
    });
  }}
>
  Isolate
</Button>
```

### Programmatic Model Loading

In any component, access the store:

```typescript
import { useConfiguratorStore } from '@/store/configurator.store';
import { LoaderService } from '@/services/loader.service';

function MyComponent() {
  const store = useConfiguratorStore();

  async function loadModel(file: File) {
    const url = await LoaderService.loadModelFromFile(file);
    store.setModelUrl(url, file.name);
  }

  return <button onClick={() => loadModel(myFile)}>Load</button>;
}
```

### Access Scene State

```typescript
const store = useConfiguratorStore();

// Get all meshes
store.meshes.forEach(mesh => {
  console.log(mesh.name, mesh.visible);
});

// Get all materials
store.materials.forEach(mat => {
  console.log(mat.name, mat.color);
});

// Access Three.js objects directly
const firstMesh = store.meshes[0]?.ref;
const firstMaterial = store.materials[0]?.ref;
```

## Key Features

✅ **Supported Formats**: GLB, GLTF, FBX, OBJ  
✅ **Automatic Conversion**: All formats converted to GLB  
✅ **In-Memory Cache**: Converted models cached locally  
✅ **Mesh Visibility**: Toggle any mesh on/off  
✅ **Material Colors**: Change any material color in real-time  
✅ **Export**: Download modified model as GLB  
✅ **Responsive**: Works on desktop (mobile optimization pending)  
✅ **Type-Safe**: Full TypeScript implementation  

## Architecture Highlights

- **React Three Fiber**: Single canvas with modular Three.js setup
- **Zustand State**: Global store for all model data
- **Service Layer**: Separate concerns for file handling, conversion, loading
- **Type Safety**: Strict TypeScript throughout
- **Performance**: Direct Three.js mutations, no React overhead

## Troubleshooting

### "File format not supported"
Make sure your file is in one of the supported formats: `.glb`, `.gltf`, `.fbx`, or `.obj`

### "Model appears very small or very large"
The camera auto-fits to your model. If it's too far/close, the model might have unusual scale. Try the "Fit to View" button.

### "Colors aren't updating"
Make sure the material type is supported. The configurator works best with models using `MeshStandardMaterial` or `MeshPhongMaterial`.

### "Model is black"
Ensure your model has proper lighting. The scene includes both ambient and directional lights. Try rotating the model to see if it's a lighting angle issue.

## Next Steps

1. **Test with sample models**: Download GLB models from [Sketchfab](https://sketchfab.com)
2. **Customize colors**: Edit `src/components/configurator/ColorControl.tsx`
3. **Add presets**: Implement preset saving in the store
4. **Add animations**: Support for model animations coming soon
5. **Deploy**: Build with `npm run build` and deploy `dist/` folder

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed documentation.
