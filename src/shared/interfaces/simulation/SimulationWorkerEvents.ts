import { Simulation } from "./Simulation";

export enum SimulationWorkerEventType {
    StartSimulation = "START_SIMULATION",
    PauseSimulation = "PAUSE_SIMULATION",
    ResumeSimulation = "RESUME_SIMULATION",
    CancelSimulation = "CANCEL_SIMULATION",
    RequestSimpleResult = "REQUEST_SIMPLE_RESULT",
    RequestDataResult = "REQUEST_DATA_RESULT",
    RequestProbabilityAtIterations = "REQUEST_PROBABILITY_AT_ITERATIONS",
    RequestIterationsAtProbability = "REQUEST_ITERATIONS_AT_PROBABILITY"
}

export interface StartSimulationEvent {
    type: SimulationWorkerEventType.StartSimulation,
    simulation: Simulation,
    initialProbabilityAtIterations: number,
    initialIterationsAtProbability: number
}

export interface PauseSimulationEvent {
    type: SimulationWorkerEventType.PauseSimulation
}

export interface ResumeSimulationEvent {
    type: SimulationWorkerEventType.ResumeSimulation
}

export interface CancelSimulationEvent {
    type: SimulationWorkerEventType.CancelSimulation
}

export interface RequestSimpleResultSimulationEvent {
    type: SimulationWorkerEventType.RequestSimpleResult
}

export interface RequestDataResultSimulationEvent {
    type: SimulationWorkerEventType.RequestDataResult,
    requestId: number,
    maxDataPoints: number,
    threshold?: number
}

export interface RequestProbabilityAtIterations {
    type: SimulationWorkerEventType.RequestProbabilityAtIterations,
    iterations: number
}

export interface RequestIterationsAtProbability {
    type: SimulationWorkerEventType.RequestIterationsAtProbability,
    probability: number
}

export type SimulationWorkerEvent = StartSimulationEvent
    | PauseSimulationEvent
    | ResumeSimulationEvent
    | CancelSimulationEvent
    | RequestSimpleResultSimulationEvent
    | RequestDataResultSimulationEvent
    | RequestProbabilityAtIterations
    | RequestIterationsAtProbability
