export const WHITE = "#F3F0EA";

export const ORANGE = "#F2762C";
export const CREAM = "#FBE9D0";
export const CHOCOLATE = "#4A2A1E";

// Rough Melanie colouring by position on the normalised (height = 1, y-up, facing -z) model
export function MELANIE_PRESET(x: number, y: number, z: number): string {
  if (y < 0.09) return CHOCOLATE;
  if (y > 0.82) return CHOCOLATE;
  if (z < -0.06 && y > 0.16 && y < 0.5 && Math.abs(x) < 0.17) return CREAM;
  if (z < -0.18 && y > 0.5 && y < 0.72 && Math.abs(x) < 0.15) return CREAM;
  if (z > 0.2 && y > 0.28) return CREAM;
  return ORANGE;
}
