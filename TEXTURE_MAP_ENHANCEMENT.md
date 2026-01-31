# Texture Map Detection & Material Control Enhancement

## Overview
Enhanced the Inspector panel to intelligently detect and display texture maps applied to materials, and prevent color modification on textured materials.

## Changes Made

### 1. **ConfigMaterial Type Enhancement**
**File:** [src/types/ConfigMaterial.ts](src/types/ConfigMaterial.ts)

Added texture map tracking properties:
- `hasBaseColorMap` - Detects albedo/color texture
- `hasNormalMap` - Detects normal mapping
- `hasRoughnessMap` - Detects roughness texture
- `hasMetallicMap` - Detects metallic texture
- `hasAmbientOcclusionMap` - Detects AO texture

### 2. **Store Enhancements**
**File:** [src/store/configurator.store.ts](src/store/configurator.store.ts)

- Added `detectTextureMaps()` utility function
- Updated `addMaterial()` to automatically detect and attach texture map information
- Texture detection is done via Three.js material introspection

### 3. **Model Parser Update**
**File:** [src/three/ModelParser.ts](src/three/ModelParser.ts)

- Added texture map detection during model parsing
- All materials now include texture map metadata when loaded

### 4. **New TextureMapIndicator Component**
**File:** [src/components/configurator/TextureMapIndicator.tsx](src/components/configurator/TextureMapIndicator.tsx)

Visual component that displays:
- Badge showing count of applied texture maps
- Hover popover with detailed texture map list
- Warning note when base color texture is present
- Color-coded indicators for each map type

**Features:**
- Only appears if material has textures
- Amber/warning color scheme to indicate textured materials
- Helpful tooltip explaining why color control is disabled

### 5. **ColorControl Component Update**
**File:** [src/components/configurator/ColorControl.tsx](src/components/configurator/ColorControl.tsx)

- Added `disabled` prop to prevent color modification
- When disabled: Shows greyed-out swatch with "Textured" label
- Prevents accidental color changes on textured materials
- Maintains visual consistency with disabled state

### 6. **MaterialPanel Reorganization**
**File:** [src/components/configurator/MaterialPanel.tsx](src/components/configurator/MaterialPanel.tsx)

Enhanced layout to show:
1. Material name + TextureMapIndicator badge
2. ColorControl (with disabled state for textured materials)

**Layout improvements:**
- Flex column layout for better vertical space
- Texture indicator positioned with material name
- Color control takes full width when available

## User Experience Flow

1. **Model loads** → Parser detects texture maps automatically
2. **Inspector displays material** → TextureMapIndicator shows if textures present
3. **User hovers badge** → Detailed popover shows which maps are applied
4. **For textured materials:**
   - Color swatch appears greyed out
   - "Textured" label instead of hex value
   - Color picker is disabled
5. **For non-textured materials:**
   - Full color picker available
   - Can customize material color

## Benefits

✅ **Clear Visual Feedback** - Users immediately see which materials are textured  
✅ **Prevents Mistakes** - Disables color control for textured materials  
✅ **Better UX** - Explains why controls are disabled with helpful popover  
✅ **Extensible** - Easy to add more texture map types in the future  
✅ **Consistent Styling** - Uses existing design system (Tailwind + shadcn/ui)

## Future Enhancements

- Add ability to remove/swap textures
- Show texture previews in the popover
- Add metalness/roughness sliders for textured materials
- Support for other material types (non-MeshStandardMaterial)
