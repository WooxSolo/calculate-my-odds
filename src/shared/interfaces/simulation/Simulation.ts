import { ProbabilityGoal } from "../Goals";
import { ProbabilityItem } from "../Probability";

export enum SimulationType {
    AverageSimulation = "AVERAGE_SIMULATION",
    CumulativeCompletionSimulation = "CUMULATIVE_COMPLETION_SIMULATION"
}

export interface Simulation {
    probabilities: ProbabilityItem[],
    goals: ProbabilityGoal[]
}
