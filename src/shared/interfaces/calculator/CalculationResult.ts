
export enum CalculationResultType {
    AverageResult = "AVERAGE_RESULT",
    DataResult = "DATA_RESULT"
}

export interface AverageCalculationResult {
    type: CalculationResultType.AverageResult,
    iterations: number,
    totalAttempts: number
}

export interface CalculationDataPoint {
    probability: number,
    completions: number
}

export interface CalculationObjectiveResult {
    completionRate: number,
    average: number,
    iterationsAtProbability?: number,
    probabilityAtIterations: number,
    dataPoints: CalculationDataPoint[]
}

export interface DataCalculationResult {
    type: CalculationResultType.DataResult,
    totalIterations: number,
    successResult: CalculationObjectiveResult,
    failureResult: CalculationObjectiveResult,
    drawResult: CalculationObjectiveResult,
}

export type CalculationResult = DataCalculationResult
