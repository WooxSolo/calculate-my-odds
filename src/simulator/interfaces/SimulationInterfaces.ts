import { ItemSimulationFailure } from "../data-structures/failures/ItemSimulationFailure";
import { MultipleSimulationFailure } from "../data-structures/failures/MultipleSimulationFailure";
import { ItemSimulationGoal } from "../data-structures/goals/ItemSimulationGoal";
import { MultipleSimulationGoal } from "../data-structures/goals/MultipleSimulationGoal";

export interface SimulationTable {
    rollsPerIteration: number,
    items: SimulationItem[]
}

export interface SimulationItemEffect {
    index: number,
    impactedGoals: ItemSimulationGoal[],
    impactedFailures: ItemSimulationFailure[]
}

export interface SimulationItem extends SimulationItemEffect {
    probability: number
}

export enum SimulationGoalType {
    PartialCompletionGoal,
    SingularCompletionGoal
}

export interface SimulationGoalNode {
    isCompleted: boolean,
    parent?: MultipleSimulationGoal,
    reset: () => void
}

export interface SimulationFailureNode {
    hasFailed: boolean,
    parent?: MultipleSimulationFailure,
    reset: () => void
}
