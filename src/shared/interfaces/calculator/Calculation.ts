import { CalculationMethod } from "../CalculationMethods";
import { ProbabilityGoal } from "../Goals";
import { ProbabilityItem } from "../Probability";

export enum CalculationType {
    Average = "AVERAGE_CALCULATION",
    CumulativeCompletion = "CUMULATIVE_COMPLETION_CALCULATOR"
}

export interface Calculation {
    probabilities: ProbabilityItem[],
    goals: ProbabilityGoal[]
}
