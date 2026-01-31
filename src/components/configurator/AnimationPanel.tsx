/**
 * Animation Panel Component
 * Displays and controls animation clips for the loaded model
 */

import { useConfiguratorStore } from '../../store/configurator.store';
import { Play, Gauge } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Label } from '../ui/label';

export function AnimationPanel() {
  const { animations, currentAnimationId, animationSpeed, setCurrentAnimation, setAnimationSpeed } = useConfiguratorStore();

  if (animations.length === 0) {
    return (
      <div className="p-4 border rounded-lg bg-muted/30">
        <p className="text-sm text-muted-foreground">No animations found</p>
      </div>
    );
  }

  const currentAnimation = animations.find((a) => a.id === currentAnimationId);

  const handleAnimationChange = (animationId: string) => {
    setCurrentAnimation(animationId);
  };

  const handleSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const speed = parseFloat(e.target.value);
    setAnimationSpeed(speed);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <Play className="w-4 h-4" />
          Animations
          <Badge variant="secondary">{animations.length}</Badge>
        </h3>
      </div>

      {/* Animation Selector */}
      <div className="space-y-2">
        <Label htmlFor="animation-select" className="text-sm">Select Animation</Label>
        <select
          id="animation-select"
          value={currentAnimationId || ''}
          onChange={(e) => handleAnimationChange(e.target.value)}
          className="w-full p-2 text-sm rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        >
          {animations.map((animation) => (
            <option key={animation.id} value={animation.id}>
              {animation.name} ({animation.duration.toFixed(2)}s)
            </option>
          ))}
        </select>
      </div>

      {/* Current Animation Info */}
      {currentAnimation && (
        <div className="p-3 rounded-lg bg-muted/50 border border-border space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Current:</span>
            <span className="text-sm font-semibold text-foreground">{currentAnimation.name}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Duration:</span>
            <span className="text-sm text-foreground">{currentAnimation.duration.toFixed(2)}s</span>
          </div>
        </div>
      )}

      {/* Playback Controls */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm flex items-center gap-2">
            <Gauge className="w-4 h-4" />
            Speed: {animationSpeed.toFixed(2)}x
          </Label>
        </div>
        <input
          type="range"
          min="0.1"
          max="3"
          step="0.1"
          value={animationSpeed}
          onChange={handleSpeedChange}
          className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-muted accent-primary"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>0.1x</span>
          <span>1.0x</span>
          <span>3.0x</span>
        </div>
      </div>
    </div>
  );
}
