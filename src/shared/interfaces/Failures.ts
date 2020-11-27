import { ComparisonOperator } from "./Compators";
import { ProbabilityItem } from "./Probability";

export enum ProbabilityFailureType {
    SingularCompletionFailure = "SINGULAR_COMPLETION_FAILURE",
    FullCompletionFailure = "FULL_COMPLETION_FAILURE",
    PartialCompletionFailure = "PARTIAL_COMPLETION_FAILURE"
}

export interface SingularCompletionFailure {
    type: ProbabilityFailureType.SingularCompletionFailure,
    id: string,
    itemName?: string,
    comparator: ComparisonOperator,
    targetCount?: number
}

export interface FullCompletionFailure {
    type: ProbabilityFailureType.FullCompletionFailure,
    id: string,
    failures: AnyProbabilityFailure[]
}

export interface PartialCompletionFailure {
    type: ProbabilityFailureType.PartialCompletionFailure,
    id: string,
    failures: AnyProbabilityFailure[],
    minimumCompletions: number
}

export type AnyProbabilityFailure = SingularCompletionFailure
    | FullCompletionFailure
    | PartialCompletionFailure
