
export enum SimulationResultType {
    AverageResult = "AVERAGE_RESULT",
    DataResult = "DATA_RESULT"
}

export interface AverageSimulationResult {
    type: SimulationResultType.AverageResult,
    iterations: number,
    totalAttempts: number
}

export interface SimulationDataPoint {
    probability: number,
    completions: number
}

export interface DataSimulationResult {
    type: SimulationResultType.DataResult,
    iterations: number,
    dataPoints: SimulationDataPoint[]
}

export type SimulationResult = AverageSimulationResult
    | DataSimulationResult
