import { CalculationResult } from "./CalculationResult";

export enum CalculationMainEventTypes {
    ReceivedResult = "RECEIVED_RESULT",
    ReceivedProbabilityAtIterations = "RECEIVED_PROBABILITY_AT_ITERATIONS",
    ReceivedIterationsAtProbability = "RECEIVED_ITERATIONS_AT_PROBABILITY",
    FinishedCalculation = "FINISHED_CALCULATION"
}

export interface ReceivedResultCalculationEvent {
    type: CalculationMainEventTypes.ReceivedResult,
    requestId: number,
    result?: CalculationResult
}

export interface ReceivedProbabilityAtIterationsCalculationEvent {
    type: CalculationMainEventTypes.ReceivedProbabilityAtIterations,
    probability: number
}

export interface ReceivedIterationsAtProbabilityCalculationEvent {
    type: CalculationMainEventTypes.ReceivedIterationsAtProbability,
    iterations: number
}

export interface FinishedCalculationEvent {
    type: CalculationMainEventTypes.FinishedCalculation
}

export type CalculationMainEvent = ReceivedResultCalculationEvent
    | FinishedCalculationEvent
    | ReceivedProbabilityAtIterationsCalculationEvent
    | ReceivedIterationsAtProbabilityCalculationEvent
