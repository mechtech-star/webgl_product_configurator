/**
 * Viewport Component
 * Contains the main 3D Canvas
 */

import { CanvasRoot } from '../../three/CanvasRoot';

export function Viewport() {
  return (
    <div className="flex-1 relative overflow-hidden">
      <CanvasRoot className="w-full h-full" />
    </div>
  );
}
