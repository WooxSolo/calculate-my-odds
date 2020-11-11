import { ProbabilityGoal } from "../Goals";
import { ProbabilityItem } from "../Probability";

export interface Simulation {
    probabilities: ProbabilityItem[],
    goals: ProbabilityGoal[]
}
