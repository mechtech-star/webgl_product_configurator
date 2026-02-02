/**
 * Inspector Component
 * Right sidebar with model info and controls
 */

import { useMemo } from 'react';
import * as THREE from 'three';
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

    const modelStats = useMemo(() => {
        if (!store.scene) return { nodes: 0, vertices: 0, triangles: 0, drawCalls: 0 };

        let nodes = 0;
        let vertices = 0;
        let triangles = 0;

        store.scene.traverse((child) => {
            nodes++;
            if (child instanceof THREE.Mesh && child.geometry) {
                const geom = child.geometry;
                vertices += geom.attributes.position.count;
                if (geom.index) {
                    triangles += geom.index.count / 3;
                } else {
                    triangles += geom.attributes.position.count / 3;
                }
            }
        });

        const drawCalls = store.meshes.length; // Approximation: each mesh is a draw call

        return { nodes, vertices, triangles: Math.floor(triangles), drawCalls };
    }, [store.scene, store.meshes]);

    return (
        <div className="w-90 bg-card overflow-y-auto rounded-lg shadow-lg p-4">
            <Accordion type="single" collapsible defaultValue="info">
                {/* Model Info */}
                <AccordionItem value="info">
                    <AccordionTrigger className="px-4">
                        <span className="text-sm font-semibold">Model Info</span>
                    </AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-3 px-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase">Triangles</p>
                                    <p className="text-2xl font-bold text-foreground">
                                        {modelStats.triangles.toLocaleString()}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-muted-foreground uppercase">Vertices</p>
                                    <p className="text-2xl font-bold text-foreground">
                                        {modelStats.vertices.toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-xs text-muted-foreground uppercase">Draw Calls</p>
                                    <p className="text-2xl font-bold text-foreground">
                                        {modelStats.drawCalls}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-xs text-muted-foreground uppercase">Nodes</p>
                                    <p className="text-2xl font-bold text-foreground">
                                        {modelStats.nodes}
                                    </p>
                                </div>
                            </div>
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
