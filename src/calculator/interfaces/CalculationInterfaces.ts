
export type State = Int32Array

export interface CalculationTable {
    rollsPerIteration: number,
    items: CalculationItem[]
}

export interface CalculationItem {
    index: number,
    probability: number
}

export interface CalculationGoalNode {
    isCompleted: (state: State) => boolean
}

export interface CalculationFailureNode {
    hasFailed: (state: State) => boolean
}
