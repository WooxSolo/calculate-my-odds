import { ProbabilityGoal } from "../Goals";
import { ProbabilityItem } from "../Probability";

export interface Calculation {
    probabilities: ProbabilityItem[],
    goals: ProbabilityGoal[]
}
