// src/core/dirigentrix.ts

import { ElasticMcpClient } from "../integrations/elastic";
import { runHydraCore, HydraCoreResult } from "../core/hydracore";
import { Seamus, MissionPlan } from "../agents/seamus";
import { KARTRIX_MODEL, KartrixPhaseId } from "../core/kartrix";

export interface MissionContext {
  missionId: string;
  startedAt: string;
  phases: KartrixPhaseId[];
}

export interface MissionReport {
  missionId: string;
  startedAt: string;
  finishedAt: string;
  telemetryCount: number;
  anomaliesCount: number;
  executedSteps: number;
  status: "OK" | "NO_ACTION" | "ERROR";
}

export class Dirigentrix {
  constructor(
    private readonly elastic: ElasticMcpClient,
    private readonly seamus: Seamus
  ) {}

  // Główna sekwencja misji – Phase 0 → 5
  async runMission(): Promise<MissionReport> {
    const missionId = `DARTRIX-${Date.now()}`;
    const startedAt = new Date().toISOString();

    this.log(missionId, "PHASE_0_INIT", "Initiating mission…");

    const context: MissionContext = {
      missionId,
      startedAt,
      phases: KARTRIX_MODEL.map(p => p.id)
    };

    // PHASE 1 – TELEMETRY
    this.log(missionId, "PHASE_1_TELEMETRY", "Fetching telemetry from Elastic MCP…");
    const telemetry = await this.fetchTelemetrySafe(missionId);

    // PHASE 2 – ANALYSIS (HydraCore)
    this.log(missionId, "PHASE_2_ANALYSIS", "Running HydraCore anomaly analysis…");
    const analysis = this.runHydraCoreSafe(missionId, telemetry);

    // PHASE 3 – PLAN (Seamus + Gemini + Kartrix)
    this.log(missionId, "PHASE_3_PLAN", "Requesting mission plan from Seamus (Gemini)…");
    const plan = await this.generatePlanSafe(missionId, analysis, telemetry);

    // PHASE 4 – EXECUTE (stub – policzalny, bezpieczny)
    this.log(missionId, "PHASE_4_EXECUTE", "Executing mission plan steps (stub)…");
    const executedSteps = await this.executePlanStub(missionId, plan);

    // PHASE 5 – REPORT
    this.log(missionId, "PHASE_5_REPORT", "Building mission report…");
    const finishedAt = new Date().toISOString();

    const report: MissionReport = {
      missionId,
      startedAt,
      finishedAt,
      telemetryCount: telemetry.length,
      anomaliesCount: analysis.anomalies.length,
      executedSteps,
      status: this.resolveStatus(plan, analysis)
    };

    this.log(missionId, "PHASE_5_REPORT", `Mission complete with status: ${report.status}`);
    return report;
  }

  // --- PHASE HELPERS ---

  private async fetchTelemetrySafe(missionId: string): Promise<any[]> {
    try {
      const data = await this.elastic.fetchTelemetry();
      this.log(missionId, "PHASE_1_TELEMETRY", `Telemetry fetched: ${data.length} records.`);
      return data;
    } catch (err) {
      this.log(
        missionId,
        "PHASE_1_TELEMETRY",
        `ERROR fetching telemetry: ${(err as Error).message}`
      );
      return [];
    }
  }

  private runHydraCoreSafe(missionId: string, telemetry: any[]): HydraCoreResult {
    try {
      const result = runHydraCore(telemetry);
      this.log(
        missionId,
        "PHASE_2_ANALYSIS",
        `HydraCore summary: ${result.summary}, anomalies: ${result.anomalies.length}`
      );
      return result;
    } catch (err) {
      this.log(
        missionId,
        "PHASE_2_ANALYSIS",
        `ERROR in HydraCore: ${(err as Error).message}`
      );
      return { summary: "HydraCore error", anomalies: [] };
    }
  }

  private async generatePlanSafe(
    missionId: string,
    analysis: HydraCoreResult,
    telemetry: any[]
  ): Promise<MissionPlan> {
    try {
      const plan = await this.seamus.generateMissionPlan({
        anomalies: analysis.anomalies,
        telemetry
      });
      this.log(
        missionId,
        "PHASE_3_PLAN",
        `Mission plan generated with ${plan.steps.length} steps.`
      );
      return plan;
    } catch (err) {
      this.log(
        missionId,
        "PHASE_3_PLAN",
        `ERROR generating mission plan: ${(err as Error).message}`
      );
      return { steps: [] };
    }
  }

  private async executePlanStub(
    missionId: string,
    plan: MissionPlan
  ): Promise<number> {
    if (!plan.steps || plan.steps.length === 0) {
      this.log(
        missionId,
        "PHASE_4_EXECUTE",
        "No steps to execute – treating as NO_ACTION."
      );
      return 0;
    }

    for (const step of plan.steps) {
      this.log(
        missionId,
        "PHASE_4_EXECUTE",
        `EXECUTE STEP: [${step.action}] ${step.label}`
      );
      // tu w przyszłości: realne wywołania MCP / akcji systemowych
    }

    return plan.steps.length;
  }

  private resolveStatus(plan: MissionPlan, analysis: HydraCoreResult): MissionReport["status"] {
    if (!plan.steps || plan.steps.length === 0) {
      return "NO_ACTION";
    }
    if (analysis.anomalies.length === 0) {
      return "OK";
    }
    return "OK";
  }

  // --- LOGGING ---

  private log(missionId: string, phase: KartrixPhaseId | string, message: string) {
    // Na razie prosty console.log – później można podpiąć Elastic / GCP Logging
    console.log(`[${missionId}] [${phase}] ${message}`);
  }
}
