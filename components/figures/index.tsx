import type { ComponentType } from "react";
import { FuelGauge } from "./FuelGauge";
import { NozzleColors } from "./NozzleColors";

export const FIGURES = {
  "fuel-gauge": FuelGauge,
  "nozzle-colors": NozzleColors,
} satisfies Record<string, ComponentType>;

export type FigureId = keyof typeof FIGURES;
