type Mode = "Flow" | "Alert" | "Stop";
type GateState = "LOCKED" | "STABILIZING" | "COUPLED";

interface SNetInput {
  externalNoise: number;
  internalNoise: number;
  anomalyScore: number;
  intentOverride?: "alarm" | "freeze" | "protect";
}

interface HydraState {
  alertSignal: number;
  engineMode: Mode;
  ren12Mode: "SAFE" | "CHECK" | "ALERT";
  k12Gate: GateState;
  oscFrequency: number;
  oscAmplitude: number;
  oscPhase: "smooth" | "jitter" | "frozen";
  oscColor: "#00AFFF" | "#A020F0" | "#FFB300";
}

function computeAlertSignal(input: SNetInput): number {
  const base =
    0.4 * input.externalNoise +
    0.3 * input.internalNoise +
    0.3 * input.anomalyScore;

  let alert = Math.max(0, Math.min(1, base));

  if (input.intentOverride === "alarm") {
    alert = 1.0;
  }

  return alert;
}

function mapEngineMode(alertSignal: number): {
  engineMode: Mode;
  ren12Mode: "SAFE" | "CHECK" | "ALERT";
  stabilityFlag: "FULL" | "PARTIAL" | "NONE";
} {
  if (alertSignal < 0.3) {
    return {
      engineMode: "Flow",
      ren12Mode: "SAFE",
      stabilityFlag: "FULL",
    };
  } else if (alertSignal < 0.7) {
    return {
      engineMode: "Alert",
      ren12Mode: "CHECK",
      stabilityFlag: "PARTIAL",
    };
  } else {
    return {
      engineMode: "Stop",
      ren12Mode: "ALERT",
      stabilityFlag: "NONE",
    };
  }
}

function mapRen12K12(
  ren12Mode: "SAFE" | "CHECK" | "ALERT",
  stabilityFlag: "FULL" | "PARTIAL" | "NONE",
  alertSignal: number
): { ren12ModeOut: "SAFE" | "CHECK" | "ALERT"; k12Gate: GateState } {
  let ren12ModeOut = ren12Mode;
  if (alertSignal > 0.7) {
    ren12ModeOut = "ALERT";
  }

  let k12Gate: GateState = "LOCKED";
  if (stabilityFlag === "FULL" && ren12ModeOut === "SAFE") {
    k12Gate = "COUPLED";
  } else if (stabilityFlag === "PARTIAL" && ren12ModeOut !== "ALERT") {
    k12Gate = "STABILIZING";
  } else {
    k12Gate = "LOCKED";
  }

  return { ren12ModeOut, k12Gate };
}

function mapOscillator(
  alertSignal: number
): {
  oscFrequency: number;
  oscAmplitude: number;
  oscPhase: "smooth" | "jitter" | "frozen";
  oscColor: "#00AFFF" | "#A020F0" | "#FFB300";
} {
  if (alertSignal < 0.3) {
    return {
      oscFrequency: 1.0,
      oscAmplitude: 0.4,
      oscPhase: "smooth",
      oscColor: "#00AFFF",
    };
  } else if (alertSignal < 0.7) {
    return {
      oscFrequency: 2.2,
      oscAmplitude: 0.7,
      oscPhase: "jitter",
      oscColor: "#A020F0",
    };
  } else {
    return {
      oscFrequency: 0.0,
      oscAmplitude: 0.0,
      oscPhase: "frozen",
      oscColor: "#FFB300",
    };
  }
}

export function hydraTick(input: SNetInput): HydraState {
  const alertSignal = computeAlertSignal(input);

  const { engineMode, ren12Mode, stabilityFlag } = mapEngineMode(alertSignal);

  const { ren12ModeOut, k12Gate } = mapRen12K12(
    ren12Mode,
    stabilityFlag,
    alertSignal
  );

  const { oscFrequency, oscAmplitude, oscPhase, oscColor } =
    mapOscillator(alertSignal);

  return {
    alertSignal,
    engineMode,
    ren12Mode: ren12ModeOut,
    k12Gate,
    oscFrequency,
    oscAmplitude,
    oscPhase,
    oscColor,
  };
}