import { Simulation } from "./Simulation";

export enum SimulationWorkerEventType {
    StartSimulation = "START_SIMULATION",
    StopSimulation = "STOP_SIMULATION",
    RequestSimpleResult = "REQUEST_SIMPLE_RESULT",
    RequestDataResult = "REQUEST_DATA_RESULT"
}

export interface StartSimulationEvent {
    type: SimulationWorkerEventType.StartSimulation,
    simulation: Simulation
}

export interface StopSimulationEvent {
    type: SimulationWorkerEventType.StopSimulation
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
    | StopSimulationEvent
    | RequestSimpleResultSimulationEvent
    | RequestDataResultSimulationEvent
