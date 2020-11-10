import { ComparisonOperator } from "./Compators";
import { ProbabilityItem } from "./Probability";

export interface ProbabilityGoal {
    type: "PROBABILITY_GOAL",
    id: string,
    item?: ProbabilityItem,
    comparator: ComparisonOperator,
    targetCount?: number
}

export type AnyProbabilityGoal = ProbabilityGoal
