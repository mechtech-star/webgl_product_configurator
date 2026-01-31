/**
 * Mesh Panel Component
 * Lists all meshes with visibility toggles
 */

import { useConfiguratorStore } from '../../store/configurator.store';
import { VisibilityToggle } from './VisibilityToggle';
import { Separator } from '../ui/separator';

export function MeshPanel() {
  const store = useConfiguratorStore();

  if (store.meshes.length === 0) {
    return (
      <div className="text-sm text-muted-foreground py-4 px-4">
        No meshes loaded
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {store.meshes.map((mesh, idx) => (
        <div key={mesh.id}>
          <div className="flex items-center justify-between px-4 py-2 hover:bg-muted rounded">
            <span className="text-sm font-medium text-foreground truncate flex-1">
              {mesh.name}
            </span>
            <VisibilityToggle meshId={mesh.id} isVisible={mesh.visible} />
          </div>
          {idx < store.meshes.length - 1 && <Separator />}
        </div>
      ))}
    </div>
  );
}
