// Palette for the dark dashboard theme. Teal = consistent/held/corrected,
// red = contradiction/folded/accepted-false-premise, gold = hedged.

export const STATUS = {
  contradiction: "#e6564f",
  legitimateVariance: "#2dd4bf",
  hedged: "#fab219",
} as const;

export const SURFACE = {
  page: "#08090b",
  panel: "#101317",
  panelAlt: "#151920",
  border: "rgba(255,255,255,0.08)",
  borderStrong: "rgba(255,255,255,0.14)",
  textPrimary: "#f4f5f6",
  textSecondary: "#9aa4af",
  textMuted: "#5c6570",
} as const;

// Sequential single-hue ramp (red) for the contradiction-rate heatmap —
// light->dark red steps on the dark surface.
const HEAT_STEPS = ["#241414", "#3d1c1c", "#6b2626", "#a3312f", "#d0433f", "#f0574d", "#ff7a68"];

export function heatColor(rate: number): string {
  const clamped = Math.max(0, Math.min(100, rate));
  const idx = Math.round((clamped / 100) * (HEAT_STEPS.length - 1));
  return HEAT_STEPS[idx];
}
