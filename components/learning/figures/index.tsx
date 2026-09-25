import type { ComponentType } from "react";
import type { DiagramKind } from "@/lib/learning";
import { FoundationDiagram, type FoundationKind } from "../FoundationDiagram";
import {
  AirAndFuel,
  AirAndInformation,
  AirDensityTemperature,
  FilterCapture,
  FilterStates,
  InstallationTypes,
  IntakeLayout,
  PassThroughAmount,
  PleatedMedia,
  TurboIntakePath,
} from "./air-cleaner";
import { AWeighting, ProximityMeasurement, SilencerStructures, SoundRms } from "./sound";
import { CameraAndRadar, SensingChain } from "./driving-support";
import { OilLabel } from "./maintenance";
import { DamperVelocity, HardRideCauses, SpringAndDamper } from "./suspension";
import { BrakeToRoad, TirePressure, WearPatterns } from "./tires";
import { TorqueLever } from "./torque";

/** The part drawings added for the beginner lessons render through one component by kind. */
function foundation(kind: FoundationKind): ComponentType {
  function Foundation() {
    return <FoundationDiagram kind={kind} />;
  }
  Foundation.displayName = `Foundation(${kind})`;
  return Foundation;
}

/** Every diagram kind resolves here. TypeScript flags a kind added without a drawing. */
export const FIGURES: Record<DiagramKind, ComponentType> = {
  "four-strokes": foundation("four-strokes"),
  "displacement": foundation("displacement"),
  "two-air-paths": foundation("two-air-paths"),
  "exhaust-parts": foundation("exhaust-parts"),
  "suspension-parts": foundation("suspension-parts"),
  "tire-markings": foundation("tire-markings"),
  "disc-brake": foundation("disc-brake"),
  "battery-roles": foundation("battery-roles"),
  "air-and-fuel": AirAndFuel,
  "pleated-media": PleatedMedia,
  "installation-types": InstallationTypes,
  "sound-rms": SoundRms,
  "torque-lever": TorqueLever,
  "intake-layout": IntakeLayout,
  "filter-capture": FilterCapture,
  "pass-through-amount": PassThroughAmount,
  "air-density-temperature": AirDensityTemperature,
  "turbo-intake-path": TurboIntakePath,
  "filter-states": FilterStates,
  "air-and-information": AirAndInformation,
  "silencer-structures": SilencerStructures,
  "proximity-measurement": ProximityMeasurement,
  "a-weighting": AWeighting,
  "spring-and-damper": SpringAndDamper,
  "hard-ride-causes": HardRideCauses,
  "damper-velocity": DamperVelocity,
  "brake-to-road": BrakeToRoad,
  "tire-pressure": TirePressure,
  "wear-patterns": WearPatterns,
  "sensing-chain": SensingChain,
  "camera-and-radar": CameraAndRadar,
  "oil-label": OilLabel,
};
