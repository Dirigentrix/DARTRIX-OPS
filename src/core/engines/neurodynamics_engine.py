from dataclasses import dataclass, field
from enum import Enum
from typing import Dict, List, Optional
import math

class StateMode(Enum):
    LINEAR = "LINEAR"
    CURVED = "CURVED"
    CRITICAL = "CRITICAL"

@dataclass
class LayerState:
    name: str
    phase: float = 0.0  # Normalized phase [0, 1]
    frequency: float = 1.0
    amplitude: float = 1.0

@dataclass
class NeurodynamicsResult:
    resonance: float
    curvature: float
    mode: StateMode
    layer_states: Dict[str, LayerState]

class NeurodynamicsEngine:
    """
    NeurodynamicsEngine component for the GitLab Showcase Track.
    Implements a 9-layer coupled oscillator model based on DARTRIX architecture.
    """

    LAYERS = [
        "Bodźce", "Emocje", "Myśli", "Świadomość", 
        "Meta-świadomość", "Czas wew.", "Czas przestrz.", 
        "Meta-czas", "Zakrzywienie"
    ]

    KAPPA_THRESHOLDS = {
        "CURVED": 0.9,
        "CRITICAL": 1.5
    }

    def __init__(self, constellation_id: str = "constellation_5"):
        self.constellation_id = constellation_id
        self.states: Dict[str, LayerState] = {
            name: LayerState(name=name) for name in self.LAYERS
        }
        # Coupling matrix placeholder (simplified to uniform coupling for this API)
        self.coupling_strength = 0.1

    def update_layer(self, name: str, phase: Optional[float] = None, frequency: Optional[float] = None):
        """Updates the state of a specific layer."""
        if name not in self.states:
            raise ValueError(f"Unknown layer: {name}")
        
        if phase is not None:
            self.states[name].phase = phase % 1.0
        if frequency is not None:
            self.states[name].frequency = frequency

    def compute_dynamics(self) -> NeurodynamicsResult:
        """
        Computes resonance and curvature from per-layer values and pairwise coupling.
        Returns the current neurodynamic state.
        """
        # Calculate global resonance as the mean coherence of oscillators
        # In a simplified 9-layer model, resonance R = |(1/N) * sum(exp(i * 2pi * phase_j))|
        sum_sin = sum(math.sin(2 * math.pi * s.phase) for s in self.states.values())
        sum_cos = sum(math.cos(2 * math.pi * s.phase) for s in self.states.values())
        
        n = len(self.LAYERS)
        resonance = math.sqrt(sum_sin**2 + sum_cos**2) / n
        
        # Curvature kappa is derived from resonance and coupling topology
        # Here we use a proportional mapping for the DARTRIX showcase
        curvature = resonance * (1.0 + self.coupling_strength * n)
        
        # Determine mode based on kappa thresholds
        if curvature >= self.KAPPA_THRESHOLDS["CRITICAL"]:
            mode = StateMode.CRITICAL
        elif curvature >= self.KAPPA_THRESHOLDS["CURVED"]:
            mode = StateMode.CURVED
        else:
            mode = StateMode.LINEAR

        return NeurodynamicsResult(
            resonance=round(resonance, 4),
            curvature=round(curvature, 4),
            mode=mode,
            layer_states=self.states.copy()
        )

    def __repr__(self):
        return f"<NeurodynamicsEngine(constellation={self.constellation_id}, layers={len(self.LAYERS)})>"
