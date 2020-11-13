import { SimulationResult } from "./SimulationResult";

export enum SimulationMainEventTypes {
    ReceivedResult = "RECEIVED_RESULT",
    ReceivedProbabilityAtIterations = "RECEIVED_PROBABILITY_AT_ITERATIONS",
    ReceivedIterationsAtProbability = "RECEIVED_ITERATIONS_AT_PROBABILITY"
}

export interface ReceivedResultSimulationEvent {
    type: SimulationMainEventTypes.ReceivedResult,
    requestId: number,
    result?: SimulationResult
}

export interface ReceivedProbabilityAtIterationsEvent {
    type: SimulationMainEventTypes.ReceivedProbabilityAtIterations,
    probability: number
}

export interface ReceivedIterationsAtProbabilityEvent {
    type: SimulationMainEventTypes.ReceivedIterationsAtProbability,
    iterations: number
}

export type SimulationMainEvent = ReceivedResultSimulationEvent
    | ReceivedProbabilityAtIterationsEvent
    | ReceivedIterationsAtProbabilityEvent
