export type KartrixPhaseId =
  | "PHASE_0_INIT"
  | "PHASE_1_TELEMETRY"
  | "PHASE_2_ANALYSIS"
  | "PHASE_3_PLAN"
  | "PHASE_4_EXECUTE"
  | "PHASE_5_REPORT";

export interface KartrixPhase {
  id: KartrixPhaseId;
  label: string;
  intent: string;      // taktyczny cel fazy
  constraints: string; // ograniczenia – czego NIE wolno robić
}

export const KARTRIX_MODEL: KartrixPhase[] = [
  {
    id: "PHASE_0_INIT",
    label: "Initiate Mission",
    intent: "Przygotowanie środowiska, start misji.",
    constraints: "ŻADNYCH zmian w systemach, tylko setup i logowanie stanu."
  },
  {
    id: "PHASE_1_TELEMETRY",
    label: "Telemetry Intake",
    intent: "Pobranie logów i telemetrii z Elastic MCP.",
    constraints: "ŻADNYCH akcji naprawczych, tylko odczyt danych."
  },
  {
    id: "PHASE_2_ANALYSIS",
    label: "HydraCore Analysis",
    intent: "Wykrycie anomalii i odchyleń na podstawie telemetrii.",
    constraints: "Brak modyfikacji systemu, tylko diagnoza i klasyfikacja."
  },
  {
    id: "PHASE_3_PLAN",
    label: "Mission Plan",
    intent: "Ułożenie sekwencji działań na podstawie danych i anomalii.",
    constraints: "Tylko wybór z ISTNIEJĄCYCH procedur, ZERO nowych akcji."
  },
  {
    id: "PHASE_4_EXECUTE",
    label: "Execute Procedures",
    intent: "Wykonanie zatwierdzonych kroków misji.",
    constraints: "Brak generowania nowych kroków, tylko realizacja planu."
  },
  {
    id: "PHASE_5_REPORT",
    label: "Mission Report",
    intent: "Podsumowanie misji, raport z anomalii i wykonanych kroków.",
    constraints: "Brak dalszych zmian w systemie, tylko opis i wnioski."
  }
];

// 🔐 Automatyczny „sejf” – tekstowy model dla Gemini/Seamusa
export function buildKartrixSystemPrompt(): string {
  const lines: string[] = [];

  lines.push(
    "Jesteś taktycznym agentem misji (Seamus/Gemini) działającym WYŁĄCZNIE w ramach modelu Kartrix."
  );
  lines.push("NIE WOLNO CI dodawać nowych faz, akcji ani procedur.");
  lines.push("Masz działać jak na strzelnicy: precyzyjnie, w ramach tarczy, bez wychodzenia poza model.\\n");

  for (const phase of KARTRIX_MODEL) {
    lines.push(`FAZA: \${phase.id} – \${phase.label}`);
    lines.push(`INTENT: \${phase.intent}`);
    lines.push(`CONSTRAINTS: \${phase.constraints}`);
    lines.push("");
  }

  lines.push(
    "Twoje zadanie: na podstawie telemetrii, anomalii (HydraCore) i listy procedur ułóż PLAN MISJI."
  );
  lines.push(
    "Plan MISJI to uporządkowana lista kroków, gdzie każdy krok wybiera TYLKO istniejącą procedurę."
  );
  lines.push(
    "Jeśli nie masz wystarczających danych – zwróć NO_ACTION."
  );
  lines.push(
    "Jeśli jakikolwiek krok wychodzi poza model Kartrix – odmów wykonania i pozostań w bieżącej fazie."
  );
  lines.push(
    "ZWRACAJ TYLKO: { steps: [...] } – nic więcej."
  );

  return lines.join("\\n");
}