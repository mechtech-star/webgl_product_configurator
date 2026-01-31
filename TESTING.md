# Testing Guide

## Development Server Status

✅ **RUNNING** at `http://localhost:5173`

The development server is currently active and serving the application.

## Testing Checklist

### 1. Initial Load

- [ ] Open browser to `http://localhost:5173`
- [ ] Page loads without errors
- [ ] Top bar visible with "Product Configurator" title
- [ ] File uploader visible in center (or sidebar when model loaded)
- [ ] No console errors (F12 to check)

### 2. File Upload Testing

#### Test with GLB File
- [ ] Drag a .glb file onto upload area
- [ ] Loading indicator appears ("Processing model locally...")
- [ ] File loading completes within 2-10 seconds
- [ ] 3D model appears in viewport
- [ ] Console shows no errors

#### Test with GLTF File
- [ ] Upload a .gltf file
- [ ] Conversion happens automatically
- [ ] Model displays correctly
- [ ] No console errors

#### Test with FBX File
- [ ] Upload a .fbx file
- [ ] Conversion to GLB happens
- [ ] Model displays in 3D viewport
- [ ] Lighting looks correct

#### Test with OBJ File
- [ ] Upload a .obj file (with or without .mtl)
- [ ] Conversion completes
- [ ] Model displays with correct geometry

#### Test Unsupported Format
- [ ] Try uploading a .png or .jpg file
- [ ] Error message shown: "Unsupported file format"

### 3. UI Layout Testing

After loading a model:

#### Top Bar
- [ ] Model name displayed
- [ ] "Fit camera" button visible and works
- [ ] "Download" button visible and works
- [ ] "Reset" button visible and works
- [ ] Buttons are properly spaced

#### Left Sidebar
- [ ] File uploader remains visible
- [ ] Can upload new model while one is loaded
- [ ] New upload replaces old model

#### Right Inspector
- [ ] Accordion panels visible
- [ ] "Model Info" panel shows:
  - [ ] Model name
  - [ ] Mesh count
  - [ ] Material count
- [ ] "Meshes" panel shows all meshes with names
- [ ] "Materials" panel shows all materials

### 4. 3D Viewport Controls

- [ ] **Left-click drag**: Rotate model smoothly
- [ ] **Middle-click drag**: Pan camera around model
- [ ] **Mouse wheel**: Zoom in/out
- [ ] **Double-click**: Does nothing (expected)
- [ ] Model stays within viewport during rotation
- [ ] Model doesn't get lost when rotating

### 5. Mesh Visibility Testing

- [ ] Click eye icon next to a mesh
- [ ] Mesh disappears from 3D view immediately
- [ ] Click eye icon again
- [ ] Mesh reappears
- [ ] Multiple meshes can be toggled
- [ ] All meshes can be hidden
- [ ] At least one mesh stays visible (or all can be hidden - check intent)

### 6. Material Color Testing

- [ ] Click color swatch next to material
- [ ] Color picker dialog opens
- [ ] Select a new color
- [ ] Material in 3D view updates immediately
- [ ] Color value shown next to material name
- [ ] Multiple materials can have different colors
- [ ] Color persists when rotating/zooming model

### 7. Export Testing

- [ ] Click Download button
- [ ] GLB file downloads to Downloads folder
- [ ] File is named with model name
- [ ] File size is reasonable (50KB-50MB depending on model)
- [ ] Downloaded file can be opened in other 3D viewers:
  - [ ] Babylon.js Sandbox (babylonjs-playground.com)
  - [ ] Three.js Editor
  - [ ] Sketchfab
- [ ] Colors from configurator are preserved in exported file
- [ ] Mesh visibility is preserved in exported file

### 8. Reset Testing

- [ ] Click Reset button in top bar
- [ ] UI returns to empty state
- [ ] Model disappears from viewport
- [ ] Sidebar shows file uploader only
- [ ] Can upload new model immediately after reset

### 9. Performance Testing

#### Large Model (>10MB)
- [ ] Upload large model
- [ ] Loading takes expected time
- [ ] Model displays correctly
- [ ] Rotation is smooth (60 FPS)
- [ ] No lag when toggling visibility
- [ ] No lag when changing colors

#### Many Meshes (>100)
- [ ] Mesh list scrolls smoothly
- [ ] Toggling each mesh is instant
- [ ] No UI slowdown

#### Many Materials (>50)
- [ ] Material list scrolls smoothly
- [ ] Color pickers work instantly
- [ ] No UI lag

### 10. Edge Cases

- [ ] Upload same file twice → Works correctly
- [ ] Upload multiple files in succession → Latest one loads
- [ ] Change color while rotating model → No glitches
- [ ] Toggle mesh while changing color → Both work
- [ ] Hide all meshes → Viewport empty (as expected)
- [ ] Export with no meshes visible → File still valid
- [ ] Close and reopen browser → Resets to empty state (expected)

### 11. Browser Compatibility

Test in different browsers:

- [ ] **Chrome** - Full support
- [ ] **Firefox** - Full support
- [ ] **Safari** - Full support
- [ ] **Edge** - Full support

### 12. Responsive Design

- [ ] Resize browser window → Layout adapts
- [ ] Minimize to small window → Still usable
- [ ] Maximize to large window → Still looks good
- [ ] Right panel doesn't hide content when narrow

### 13. Keyboard & Accessibility

- [ ] Tab through buttons → All focusable
- [ ] Enter key activates buttons → Works
- [ ] Color picker keyboard navigation → Works

### 14. Error Recovery

- [ ] Interrupt file upload (close/reload) → App recovers
- [ ] Clear browser cache → App still works
- [ ] Disable JavaScript → Shows graceful message (or error)

## Sample Models for Testing

### Where to Get Test Models

1. **Sketchfab** (sketchfab.com)
   - Search for GLB models
   - Download without textures (simpler)
   - Examples: "cube", "lowpoly model"

2. **Three.js Examples** (threejs.org/examples)
   - Contains sample models
   - Good for testing different formats

3. **Babylon.js Models**
   - Free sample models
   - Good format variety

### Recommended Test Set

1. **Simple Model** (cube, sphere, box)
   - For basic testing
   - ~100KB GLB

2. **Complex Model** (character, scene)
   - Multiple meshes
   - Multiple materials
   - ~5-20MB

3. **FBX Model**
   - Test conversion
   - Various complexity levels

4. **OBJ Model**
   - Test OBJ loading
   - With and without MTL

## Console Checks

Press F12 to open Developer Tools and check Console tab:

### No Errors Expected
```
✓ No red error messages
✓ No 404 or network errors
✓ No THREE errors
✓ No React warnings
```

### Expected Logs
```
✓ Model loaded: [timestamp]
✓ Meshes found: X
✓ Materials found: Y
```

### If You See Errors
- Note the error message
- Check file format is supported
- Try a different model file
- Check browser console for details

## Performance Checklist

### Rendering
- [ ] 60 FPS during rotation (check DevTools)
- [ ] No frame drops when toggling meshes
- [ ] Smooth zooming with mouse wheel
- [ ] No lag when changing colors

### Memory
- [ ] Model loaded without crashes
- [ ] Memory usage reasonable for file size
- [ ] No memory leaks on repeated uploads/resets
- [ ] Check DevTools → Memory → Heap snapshot

### Network
- [ ] Files loaded from cache (second upload faster)
- [ ] No unnecessary network requests
- [ ] Canvas doesn't reload network assets

## Feature Validation

### File Upload Pipeline
```
File selected
  ↓ [✓] FileService validates format
  ↓ [✓] LoaderService loads file
  ↓ [✓] ConverterService converts if needed
  ↓ [✓] CacheService stores locally
  ↓ [✓] GLB loaded into Three.js
  ↓ [✓] ModelParser extracts data
  ↓ [✓] Store updated
  ↓ [✓] UI reflects changes
```

### Visibility Toggle Pipeline
```
Eye icon clicked
  ↓ [✓] Click handler triggered
  ↓ [✓] Store action called
  ↓ [✓] Store state updated
  ↓ [✓] Three.js ref mutated
  ↓ [✓] Canvas renders change
  ↓ [✓] Icon updates (open/closed eye)
```

### Color Update Pipeline
```
Color picked
  ↓ [✓] Color input changed
  ↓ [✓] Store action called
  ↓ [✓] Store state updated
  ↓ [✓] Three.js material.color.set() called
  ↓ [✓] Canvas renders change
  ↓ [✓] Hex value displayed
```

## Regression Testing

After any code changes, verify:

1. Build completes without errors
   ```bash
   npm run build
   ```

2. Dev server starts
   ```bash
   npm run dev
   ```

3. Run through Complete Testing Checklist above

## Automated Testing (Future)

Potential test setup:
```javascript
// Example Jest test
describe('FileUploader', () => {
  it('accepts GLB files', () => {
    // ...
  });
  
  it('rejects unsupported formats', () => {
    // ...
  });
});

describe('ModelLoader', () => {
  it('loads GLB correctly', () => {
    // ...
  });
  
  it('extracts meshes and materials', () => {
    // ...
  });
});
```

## Troubleshooting During Testing

### "Module not found" Error
- Run `npm install --legacy-peer-deps`
- Clear node_modules: `rm -r node_modules` then npm install

### "Canvas is not displaying"
- Check browser console for WebGL errors
- Ensure GPU acceleration is enabled
- Try different browser
- Update graphics drivers

### "Model appears tiny or huge"
- Click "Fit camera" button
- Or manually zoom with mouse wheel
- Model might have unusual scale

### "Colors not updating"
- Check Material panel shows materials
- Verify browser console for errors
- Try with different model

### "Export fails"
- Check browser console for export error
- Verify model has content
- Try exporting different model

## Success Criteria

✅ Application is production-ready if:

1. All file formats upload and display correctly
2. All UI elements render and respond to interactions
3. Model transformations (visibility, color) work instantly
4. Export functionality produces valid GLB files
5. No console errors during normal usage
6. 60 FPS maintained during interactions
7. Application handles edge cases gracefully
8. Performance acceptable for typical 3D models

## Testing Duration

- **Quick Test**: 5 minutes (basic flow)
- **Standard Test**: 15 minutes (all features)
- **Comprehensive Test**: 30 minutes (performance + edge cases)
- **Full Regression**: 45 minutes (complete checklist)

---

**Status**: Ready for testing ✅

Start by opening http://localhost:5173 and working through the checklist above.
