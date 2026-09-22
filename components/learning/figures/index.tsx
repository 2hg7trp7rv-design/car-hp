import type { ComponentType } from "react";
import type { DiagramKind } from "@/lib/learning";
import { AirAndFuel, InstallationTypes, PleatedMedia } from "./air-cleaner";
import { SoundRms } from "./sound";
import {
  CatalogAnatomy,
  DriveForceBySpeed,
  DriveForceChain,
  TorqueAndPowerCurves,
  TorqueCurveShapes,
  TorqueFeel,
  TorqueLever,
  TorqueVsRpm,
  TwoPointsTwoCurves,
} from "./torque";

/** Every diagram kind resolves here. TypeScript flags a kind added without a drawing. */
export const FIGURES: Record<DiagramKind, ComponentType> = {
  "air-and-fuel": AirAndFuel,
  "pleated-media": PleatedMedia,
  "installation-types": InstallationTypes,
  "sound-rms": SoundRms,
  "torque-lever": TorqueLever,
  "torque-vs-rpm": TorqueVsRpm,
  "torque-feel": TorqueFeel,
  "catalog-anatomy": CatalogAnatomy,
  "torque-and-power-curves": TorqueAndPowerCurves,
  "drive-force-chain": DriveForceChain,
  "drive-force-by-speed": DriveForceBySpeed,
  "torque-curve-shapes": TorqueCurveShapes,
  "two-points-two-curves": TwoPointsTwoCurves,
};
