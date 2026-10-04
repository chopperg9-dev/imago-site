export type FoxPart = "head" | "ears" | "body" | "belly" | "legs" | "tail" | "tailTip";
export type FoxColors = Record<FoxPart, string>;

export const WHITE = "#F3F0EA";
export const UNPAINTED: FoxColors = { head: WHITE, ears: WHITE, body: WHITE, belly: WHITE, legs: WHITE, tail: WHITE, tailTip: WHITE };
export const MELANIE: FoxColors = { head: "#F2762C", ears: "#4A2A1E", body: "#F2762C", belly: "#FBE9D0", legs: "#4A2A1E", tail: "#F2762C", tailTip: "#FBE9D0" };
