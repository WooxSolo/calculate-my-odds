
export enum SimulationResultType {
    DataResult = "DATA_RESULT"
}

export interface SimulationDataPoint {
    probability: number,
    completions: number
}

export interface DataSimulationResult {
    type: SimulationResultType.DataResult,
    iterations: number,
    attempts: number,
    successfulIterations: number,
    dataPoints: SimulationDataPoint[],
    iterationsAtProbability: number,
    probabilityAtIterations: number,
    highestIteration: number
}

export type SimulationResult = DataSimulationResult
