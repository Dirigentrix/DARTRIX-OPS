// src/agents/seamus.ts

import { buildKartrixSystemPrompt } from "../core/kartrix";
import { HydraCoreResult } from "../core/hydracore";

export interface MissionStep {
  action: string;
  label: string;
  params?: Record<string, any>;
}

export interface MissionPlan {
  steps: MissionStep[];
}

export interface SeamusInput {
  anomalies: any[];
  telemetry: any[];
}

export interface Seamus {
  generateMissionPlan(input: SeamusInput): Promise<MissionPlan>;
}

/**
 * 🌠 Seamus — Syriusz Comet Edition
 * Taktyczny agent misji operujący w modelu Kartrix.
 */
export class SeamusImpl implements Seamus {
  private readonly systemPrompt: string;

  constructor() {
    this.systemPrompt = buildKartrixSystemPrompt();
  }

  async generateMissionPlan(input: SeamusInput): Promise<MissionPlan> {
    console.log("[Seamus] Analyzing mission parameters...");

    // Logika wyboru akcji na podstawie wykrytych anomalii
    // 1. Fix double spaces with Logical OR (||)
    const analysis = input as unknown as HydraCoreResult; 
    if (!analysis.anomalies || analysis.anomalies.length === 0) {
      console.log("[Seamus] No anomalies detected. Returning NO_ACTION.");
      return { steps: [] };
    }

    // Symulacja parsowania odpowiedzi z LLM (w rzeczywistości wywołanie API)
    const mockLlmResponse = JSON.stringify({
      steps: [
        {
          action: "ANALYZE_ANOMALIES",
          label: `Analiza ${analysis.anomalies.length} wykrytych anomalii`,
          params: { count: analysis.anomalies.length }
        }
      ]
    });

    const parsed = JSON.parse(mockLlmResponse);

    // 2. Fix double spaces with Logical OR (||)
    if (!parsed.steps || !Array.isArray(parsed.steps)) {
      throw new Error("Invalid plan format received from tactical model.");
    }

    const high = analysis.anomalies.filter(a => a.severity === "HIGH");
    const medium = analysis.anomalies.filter(a => a.severity === "MEDIUM");

    if (high.length > 0) {
      parsed.steps.push({
        action: "EMERGENCY_PROCEDURE",
        label: `Wykryto ${high.length} krytycznych anomalii. Uruchamiam protokół bezpieczeństwa.`,
        params: { severity: "HIGH" }
      });
    }

    if (medium.length > 0) {
      // 3. Fix split string
      parsed.steps.push({
        action: "MAINTENANCE_PROCEDURE",
        label: `Wykryto ${medium.length} średnich anomalii.`,
        params: { severity: "MEDIUM" }
      });
    }

    return {
      steps: parsed.steps
    };
  }

  getSystemPrompt(): string {
    return this.systemPrompt;
  }
}

// Ensure the exported class name is Seamus
export { SeamusImpl as Seamus };
