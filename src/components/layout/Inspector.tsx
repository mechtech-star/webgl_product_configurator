/**
 * Inspector Component
 * Right sidebar with model info and controls
 */

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '../ui/accordion.tsx';
import { useConfiguratorStore } from '../../store/configurator.store';
import { MeshPanel } from '../configurator/MeshPanel';
import { MaterialPanel } from '../configurator/MaterialPanel';
import { AnimationPanel } from '../configurator/AnimationPanel';

export function Inspector() {
    const store = useConfiguratorStore();

    return (
        <div className="w-90 bg-card border-l border-border overflow-y-auto rounded-lg shadow-lg m-4 p-4">
            <Accordion type="single" collapsible defaultValue="info">
                {/* Model Info */}
                <AccordionItem value="info">
                    <AccordionTrigger className="px-4">
                        <span className="text-sm font-semibold">Model Info</span>
                    </AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-3 px-4">
                            <div>
                                <p className="text-xs text-muted-foreground uppercase">Model Name</p>
                                <p className="text-sm font-medium text-foreground">
                                    {store.modelName || 'No model loaded'}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase">Meshes</p>
                                    <p className="text-2xl font-bold text-foreground">
                                        {store.meshes.length}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-muted-foreground uppercase">Materials</p>
                                    <p className="text-2xl font-bold text-foreground">
                                        {store.materials.length}
                                    </p>
                                </div>
                            </div>

                            {store.animations.length > 0 && (
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase">Animations</p>
                                    <p className="text-2xl font-bold text-foreground">
                                        {store.animations.length}
                                    </p>
                                </div>
                            )}
                        </div>
                    </AccordionContent>
                </AccordionItem>

                {/* Meshes */}
                {store.meshes.length > 0 && (
                    <AccordionItem value="meshes">
                        <AccordionTrigger className="px-4">
                            <span className="text-sm font-semibold">
                                Meshes ({store.meshes.length})
                            </span>
                        </AccordionTrigger>
                        <AccordionContent className="px-0">
                            <MeshPanel />
                        </AccordionContent>
                    </AccordionItem>
                )}

                {/* Materials */}
                {store.materials.length > 0 && (
                    <AccordionItem value="materials">
                        <AccordionTrigger className="px-4">
                            <span className="text-sm font-semibold">
                                Materials ({store.materials.length})
                            </span>
                        </AccordionTrigger>
                        <AccordionContent className="px-0">
                            <MaterialPanel />
                        </AccordionContent>
                    </AccordionItem>
                )}

                {/* Animations */}
                {store.animations.length > 0 && (
                    <AccordionItem value="animations">
                        <AccordionTrigger className="px-4">
                            <span className="text-sm font-semibold">
                                Animations ({store.animations.length})
                            </span>
                        </AccordionTrigger>
                        <AccordionContent className="px-4">
                            <AnimationPanel />
                        </AccordionContent>
                    </AccordionItem>
                )}
            </Accordion>
        </div>
    );
}
