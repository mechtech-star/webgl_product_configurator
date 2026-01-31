/**
 * Color Control Component
 * Color picker for material colors
 */

import { useRef, useEffect } from 'react';
import { useConfiguratorStore } from '../../store/configurator.store';

interface ColorControlProps {
  materialId: string;
  initialColor: string;
}

export function ColorControl({ materialId, initialColor }: ColorControlProps) {
  const store = useConfiguratorStore();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.value = initialColor;
    }
  }, [initialColor]);

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const color = e.currentTarget.value;
    store.setMaterialColor(materialId, color);
  };

  return (
    <div className="flex items-center gap-2">
      <input
        ref={inputRef}
        type="color"
        onChange={handleColorChange}
        className="w-10 h-10 rounded cursor-pointer border border-border"
        title="Click to change color"
      />
      <span className="text-sm text-muted-foreground font-mono">{initialColor}</span>
    </div>
  );
}
