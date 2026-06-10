// src/agents/seamus.ts

import { KARTRIX_MODEL, buildKartrixSystemPrompt } from "../core/kartrix";

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
 * 🌠 SeamusSyriuszComet – Taktyczny agent misji operujący w modelu Kartrix.
 * Implementacja oparta na rygorystycznych ograniczeniach fazowych.
 */
export class SeamusSyriuszComet implements Seamus {
  private readonly systemPrompt: string;

  constructor() {
    this.systemPrompt = buildKartrixSystemPrompt();
  }

  /**
   * Generuje plan misji na podstawie dostarczonych anomalii i telemetrii.
   * Proces uwzględnia ograniczenia modelu Kartrix.
   */
  async generateMissionPlan(input: SeamusInput): Promise<MissionPlan> {
    console.log("[SeamusSyriuszComet] Analyzing telemetry and anomalies...");

    // Logika wyboru akcji na podstawie wykrytych anomalii
    // W rzeczywistym wdrożeniu tutaj następuje wywołanie LLM (Gemini) z systemPrompt
    const steps: MissionStep[] = [];

    if (input.anomalies.length > 0) {
      steps.push({
        action: "ANALYZE_ANOMALIES",
        label: `Analiza ${input.anomalies.length} wykrytych anomalii`,
        params: { count: input.anomalies.length }
      });

      steps.push({
        action: "GENERATE_REMEDY",
        label: "Przygotowanie kroków naprawczych zgodnie z procedurą",
        params: { urgency: "HIGH" }
      });
    }

    // Jeśli brak anomalii, Seamus może zaproponować rutynowe sprawdzenie lub NO_ACTION
    if (steps.length === 0) {
      console.log("[SeamusSyriuszComet] No anomalies detected. Mission plan empty.");
      return { steps: [] };
    }

    console.log(`[SeamusSyriuszComet] Mission plan created with ${steps.length} steps.`);
    
    return {
      steps
    };
  }

  /**
   * Metoda pomocnicza do pobrania aktualnego promptu systemowego Kartrix.
   */
  getSystemPrompt(): string {
    return this.systemPrompt;
  }
}
