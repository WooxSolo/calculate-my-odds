
export enum SimulationResultType {
    DataResult = "DATA_RESULT"
}

export interface SimulationDataPoint {
    probability: number,
    completions: number
}

export interface SimulationObjectiveResult {
    totalAttempts: number,
    successfulRounds: number,
    iterationsAtProbability?: number,
    probabilityAtIterations: number,
    dataPoints: SimulationDataPoint[]
}

export interface DataSimulationResult {
    type: SimulationResultType.DataResult,
    totalRounds: number,
    successResult: SimulationObjectiveResult,
    failureResult: SimulationObjectiveResult,
    drawResult: SimulationObjectiveResult,
    highestIteration: number,
    unknownResults: number,
    maxIterations: number
}

export type SimulationResult = DataSimulationResult
