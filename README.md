# WebGL Product Configurator

A client-side 3D product configurator and viewer built with React, Three.js, and React Three Fiber. This is a portfolio project demonstrating real-time model loading, material editing, mesh visibility control, and GLB export — all running fully in the browser.

**Project type:** Portfolio project

**Live demo:** (Run locally — see Quick Start)

## Key Features

- Load multiple 3D formats (GLB, GLTF, FBX, OBJ) — non-GLB formats are converted to GLB in-browser.
- Real-time mesh visibility toggles and material color editing.
- Texture map detection and indicators for mapped materials.
- Animation playback and simple mixer controls.
- Export the modified scene to GLB with all changes applied.

## Tech Stack

- React
- TypeScript
- Three.js
- React Three Fiber
- Zustand (state management)
- Vite (dev server / build)

## Quick Start

Prerequisites: Node.js (16+) and npm/yarn.

1. Install dependencies

```bash
npm install
```

2. Run development server

```bash
npm run dev
```

3. Build for production

```bash
npm run build
npm run preview
```

## How to Use

1. Open the app in your browser (`http://localhost:5173` by default).
2. Use the File Uploader to drag & drop a supported 3D file or select one from disk.
3. Inspect meshes and materials in the Inspector panel — toggle visibility, pick colors, and view texture indicators.
4. Play available animations via the Animation panel.
5. Export the current scene as a GLB using the TopBar export/download action.

## Project Structure (high level)

- `src/three/` — R3F canvas root, scene setup, model loader and parser, exporters.
- `src/store/configurator.store.ts` — Zustand store with model/mesh/material state and actions.
- `src/components/configurator/` — UI controls: `FileUploader`, `MeshPanel`, `MaterialPanel`, `ColorControl`, `AnimationPanel`.
- `src/services/` — File loaders, converters and caching services.
- `src/utils/` — Three.js helpers and texture utilities.

See the source for full details and implementation patterns.

## Notes for Reviewers

- This repository is organized to keep Three.js objects as direct references in state so UI changes mutate the scene immediately without unnecessary re-renders.
- Conversion pipeline: FBX/OBJ → in-memory GLB → GLTFLoader ensures consistent handling of models.

## For Developers

- Add new controls by extending the Zustand store and hooking into `useConfiguratorScene`.
- Use `src/services/converter.service.ts` for format conversion helpers.

## License

This project is provided for portfolio/demo purposes. Use and modify freely; attribution appreciated.

---

If you'd like, I can also:

- Run the dev server and verify the app opens locally.
- Add a short GIF or screenshots to the README.
- Add a dedicated `DEMO.md` with usage walkthrough and sample models.
# React + TypeScript + Vite + shadcn/ui

This is a template for a new Vite project with React, TypeScript, and shadcn/ui.
