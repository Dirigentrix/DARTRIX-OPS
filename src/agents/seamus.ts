// src/agents/seamus.ts

import { GoogleGenerativeAI } from "@google/genai";
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
 * Tactical mission agent operating within the Kartrix model.
 * Powered by Google AI Studio (Gemini).
 */
export class SeamusImpl implements Seamus {
  private readonly genAI: GoogleGenerativeAI;
  private readonly model: any;
  private readonly systemPrompt: string;

  constructor() {
    const apiKey = process.env.GOOGLE_AI_STUDIO_API_KEY || "";
    if (!apiKey) {
      console.warn("[Seamus] Warning: GOOGLE_AI_STUDIO_API_KEY is not set. Real LLM calls will fail.");
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
      },
    });
    this.systemPrompt = buildKartrixSystemPrompt();
  }

  async generateMissionPlan(input: SeamusInput): Promise<MissionPlan> {
    console.log("[Seamus] Analyzing mission parameters with Gemini...");

    const analysis = input as unknown as HydraCoreResult;
    
    // Safety check for empty input
    if (!analysis.anomalies || analysis.anomalies.length === 0) {
      console.log("[Seamus] No anomalies detected. Returning empty plan.");
      return { steps: [] };
    }

    try {
      // Prepare prompt combining system instructions and current telemetry/anomalies
      const prompt = `
${this.systemPrompt}

CURRENT TELEMETRY DATA:
${JSON.stringify(input.telemetry, null, 2)}

DETECTED ANOMALIES (HydraCore):
${JSON.stringify(analysis.anomalies, null, 2)}

Based on the above and the Kartrix tactical model constraints, generate a Mission Plan in JSON format.
Only return the JSON object: { "steps": [...] }
`;

      const result = await this.model.generateContent(prompt);
      const responseText = result.response.text();
      
      let parsed: MissionPlan;
      try {
        parsed = JSON.parse(responseText);
      } catch (e) {
        console.error("[Seamus] Failed to parse Gemini response as JSON:", responseText);
        return this.getFallbackPlan(analysis);
      }

      if (!parsed.steps || !Array.isArray(parsed.steps)) {
        console.error("[Seamus] Invalid plan format from Gemini.");
        return this.getFallbackPlan(analysis);
      }

      return parsed;

    } catch (err) {
      console.error("[Seamus] Error during Gemini API call:", (err as Error).message);
      return this.getFallbackPlan(analysis);
    }
  }

  /**
   * Fallback logic to ensure mission continuity if LLM fails or returns invalid data.
   */
  private getFallbackPlan(analysis: HydraCoreResult): MissionPlan {
    const steps: MissionStep[] = [];
    
    const high = analysis.anomalies.filter(a => a.severity === "HIGH");
    if (high.length > 0) {
      steps.push({
        action: "EMERGENCY_PROCEDURE",
        label: `Fallback: Wykryto ${high.length} krytycznych anomalii.`,
        params: { severity: "HIGH", mode: "SAFE_FALLBACK" }
      });
    } else {
      steps.push({
        action: "NO_ACTION",
        label: "Brak zdefiniowanych kroków - fallback do stanu bezpiecznego.",
      });
    }

    return { steps };
  }

  getSystemPrompt(): string {
    return this.systemPrompt;
  }
}

// Ensure the exported class name is Seamus
export { SeamusImpl as Seamus };
