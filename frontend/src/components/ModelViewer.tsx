import { lazy, Suspense } from "react";

const FoxModel = lazy(() => import("@/components/FoxModel"));

interface Props {
  url: string;
  interactive?: boolean;
  className?: string;
  testId?: string;
}

export default function ModelViewer({ url, interactive = false, className = "", testId = "model-viewer" }: Props) {
  return (
    <div className={`relative ${className}`} data-testid={testId}>
      <Suspense fallback={<div className="absolute inset-0" />}>
        <FoxModel url={url} spinning={!interactive} autoRotate={interactive} interactive={interactive} cameraZ={4.4} modelScale={1.75} modelY={-0.88} targetY={0} />
      </Suspense>
    </div>
  );
}
