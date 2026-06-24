
Poke 🌴, [24.06.2026 15:21]
from dataclasses import dataclass

Poke 🌴, [24.06.2026 15:21]
from enum import Enum

Poke 🌴, [24.06.2026 15:21]
from typing import Dict, Optional

Poke 🌴, [24.06.2026 15:21]
import math

Poke 🌴, [24.06.2026 15:21]
class StateMode(Enum):

Poke 🌴, [24.06.2026 15:21]
LINEAR = "LINEAR"

Poke 🌴, [24.06.2026 15:21]
CURVED = "CURVED"

Poke 🌴, [24.06.2026 15:21]
CRITICAL = "CRITICAL"

Poke 🌴, [24.06.2026 15:21]
@dataclass

Poke 🌴, [24.06.2026 15:21]
class LayerState:

Poke 🌴, [24.06.2026 15:21]
name: str

Poke 🌴, [24.06.2026 15:21]
phase: float = 0.0

Poke 🌴, [24.06.2026 15:21]
frequency: float = 1.0

Poke 🌴, [24.06.2026 15:21]
amplitude: float = 1.0

Poke 🌴, [24.06.2026 15:21]
@dataclass

Poke 🌴, [24.06.2026 15:21]
class NeurodynamicsResult:

Poke 🌴, [24.06.2026 15:21]
resonance: float

Poke 🌴, [24.06.2026 15:21]
curvature: float

Poke 🌴, [24.06.2026 15:21]
mode: StateMode

Poke 🌴, [24.06.2026 15:21]
layer_states: Dict[str, LayerState]

Poke 🌴, [24.06.2026 15:21]
class NeurodynamicsEngine:

Poke 🌴, [24.06.2026 15:21]
LAYERS = [

Poke 🌴, [24.06.2026 15:21]
"Bodźce", "Emocje", "Myśli", "Świadomość",

Poke 🌴, [24.06.2026 15:21]
"Meta-świadomość", "Czas wew.", "Czas przestrz.",

Poke 🌴, [24.06.2026 15:21]
"Meta-czas", "Zakrzywienie"

Poke 🌴, [24.06.2026 15:21]
]

Poke 🌴, [24.06.2026 15:21]
KAPPA_THRESHOLDS = {"CURVED": 0.9, "CRITICAL": 1.5}

Poke 🌴, [24.06.2026 15:21]
def init(self, constellation_id: str = "constellation_5"):

Poke 🌴, [24.06.2026 15:21]
self.constellation_id = constellation_id

Poke 🌴, [24.06.2026 15:21]
self.states: Dict[str, LayerState] = {n: LayerState(name=n) for n in self.LAYERS}

Poke 🌴, [24.06.2026 15:22]
self.coupling_strength = 0.1

Poke 🌴, [24.06.2026 15:22]
def update_layer(self, name: str, phase: Optional[float] = None, frequency: Optional[float] = None):

Poke 🌴, [24.06.2026 15:22]
if name not in self.states:

Poke 🌴, [24.06.2026 15:22]
raise ValueError(f"Unknown layer: {name}")

Poke 🌴, [24.06.2026 15:22]
if phase is not None:

Poke 🌴, [24.06.2026 15:22]
self.states[name].phase = phase % 1.0

Poke 🌴, [24.06.2026 15:22]
if frequency is not None:

Poke 🌴, [24.06.2026 15:22]
self.states[name].frequency = frequency

Poke 🌴, [24.06.2026 15:22]
def compute_dynamics(self) -> NeurodynamicsResult:

Poke 🌴, [24.06.2026 15:22]
sum_sin = sum(math.sin(2 * math.pi * s.phase) for s in self.states.values())

Poke 🌴, [24.06.2026 15:22]
sum_cos = sum(math.cos(2 * math.pi * s.phase) for s in self.states.values())

Poke 🌴, [24.06.2026 15:22]
n = len(self.LAYERS)

Poke 🌴, [24.06.2026 15:22]
resonance = math.sqrt(sum_sin2 + sum_cos2) / n

Poke 🌴, [24.06.2026 15:22]
curvature = resonance * (1.0 + self.coupling_strength * n)

Poke 🌴, [24.06.2026 15:22]
if curvature >= self.KAPPA_THRESHOLDS["CRITICAL"]:

Poke 🌴, [24.06.2026 15:22]
mode = StateMode.CRITICAL

Poke 🌴, [24.06.2026 15:22]
elif curvature >= self.KAPPA_THRESHOLDS["CURVED"]:

Poke 🌴, [24.06.2026 15:22]
mode = StateMode.CURVED

Poke 🌴, [24.06.2026 15:22]
else:

Poke 🌴, [24.06.2026 15:22]
mode = StateMode.LINEAR

Poke 🌴, [24.06.2026 15:22]
return NeurodynamicsResult(round(resonance, 4), round(curvature, 4), mode, self.states.copy())

Poke 🌴, [24.06.2026 15:22]
def repr(self):

Poke 🌴, [24.06.2026 15:22]
return f"<NeurodynamicsEngine(constellation={self.constellation_id}, layers={len(self.LAYERS)})>"

Poke 🌴, [24.06.2026 15:22]
