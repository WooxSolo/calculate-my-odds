import { Simulation } from "./Simulation";

export enum SimulationWorkerEventType {
    StartSimulation = "START_SIMULATION",
    PauseSimulation = "PAUSE_SIMULATION",
    ResumeSimulation = "RESUME_SIMULATION",
    CancelSimulation = "CANCEL_SIMULATION",
    RequestSimpleResult = "REQUEST_SIMPLE_RESULT",
    RequestDataResult = "REQUEST_DATA_RESULT"
}

export interface StartSimulationEvent {
    type: SimulationWorkerEventType.StartSimulation,
    simulation: Simulation
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
    maxDataPoints: number,
    minimumDistance?: number
}

export type SimulationWorkerEvent = StartSimulationEvent
    | PauseSimulationEvent
    | ResumeSimulationEvent
    | CancelSimulationEvent
    | RequestSimpleResultSimulationEvent
    | RequestDataResultSimulationEvent
