
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

export interface DataCalculationResult {
    type: CalculationResultType.DataResult,
    totalIterations: number,
    maximumErrorRange: number,
    average: number,
    dataPoints: CalculationDataPoint[],
    iterationsAtProbability: number,
    probabilityAtIterations: number
}

export type CalculationResult = DataCalculationResult
