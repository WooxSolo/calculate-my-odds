import { SimulationResult } from "./SimulationResult";

export enum SimulationMainEventTypes {
    ReceivedResult = "RECEIVED_RESULT",
    ReceivedProbabilityAtIterations = "RECEIVED_PROBABILITY_AT_ITERATIONS",
    ReceivedIterationsAtProbability = "RECEIVED_ITERATIONS_AT_PROBABILITY",
    FinishedSimulation = "FINISHED_SIMULATION"
}

export interface ReceivedResultSimulationEvent {
    type: SimulationMainEventTypes.ReceivedResult,
    requestId: number,
    result?: SimulationResult
}

export interface ReceivedProbabilityAtIterationsEvent {
    type: SimulationMainEventTypes.ReceivedProbabilityAtIterations,
    successProbability: number,
    failureProbability: number,
    drawProbability: number
}

export interface ReceivedIterationsAtProbabilityEvent {
    type: SimulationMainEventTypes.ReceivedIterationsAtProbability,
    successIterations?: number,
    failureIterations?: number,
    drawIterations?: number
}

export interface ReceivedSimulationFinishedEvent {
    type: SimulationMainEventTypes.FinishedSimulation
}

export type SimulationMainEvent = ReceivedResultSimulationEvent
    | ReceivedProbabilityAtIterationsEvent
    | ReceivedIterationsAtProbabilityEvent
    | ReceivedSimulationFinishedEvent
