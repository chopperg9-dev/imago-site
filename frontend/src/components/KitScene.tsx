import { lazy, Suspense } from "react";
import { MarkerRing } from "@/components/Marker3D";

const FoxModel = lazy(() => import("@/components/FoxModel"));

export default function KitScene() {
  return (
    <div className="relative aspect-square w-full" data-testid="kit-3d-scene">
      <Suspense fallback={<div className="absolute inset-0" />}>
        <FoxModel spinning={false} autoRotate cameraZ={5.0} modelScale={1.75} modelY={-0.85} targetY={0}>
          <MarkerRing radius={1.35} count={8} y={0.1} />
        </FoxModel>
      </Suspense>
      <p className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap text-xs text-clay-soft">גררו כדי לסובב את הערכה</p>
    </div>
  );
}
