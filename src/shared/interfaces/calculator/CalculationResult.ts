
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
    maximumErrorRange: number,
    average: number,
    dataPoints: CalculationDataPoint[]
}

export type CalculationResult = DataCalculationResult
