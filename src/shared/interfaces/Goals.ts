import { ComparisonOperator } from "./Compators";
import { ProbabilityItem } from "./Probability";

export enum ProbabilityGoalType {
    SingularCompletionGoal = "SINGULAR_COMPLETION_GOAL",
    FullCompletionGoal = "FULL_COMPLETION_GOAL",
    PartialCompletionGoal = "PARTIAL_COMPLETION_GOAL"
}

export interface SingularCompletionGoal {
    type: ProbabilityGoalType.SingularCompletionGoal,
    id: string,
    itemName?: string,
    comparator: ComparisonOperator,
    targetCount?: number
}

export interface FullCompletionGoal {
    type: ProbabilityGoalType.FullCompletionGoal,
    id: string,
    goals: AnyProbabilityGoal[]
}

export interface PartialCompletionGoal {
    type: ProbabilityGoalType.PartialCompletionGoal,
    id: string,
    goals: AnyProbabilityGoal[],
    minimumCompletions: number
}

export type AnyProbabilityGoal = SingularCompletionGoal
    | FullCompletionGoal
    | PartialCompletionGoal
