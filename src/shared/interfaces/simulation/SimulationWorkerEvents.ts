import { Simulation, SimulationType } from "./Simulation";

export enum SimulationWorkerEventType {
    StartSimulation = "START_SIMULATION",
    StopSimulation = "STOP_SIMULATION",
    RequestResult = "REQUEST_RESULT",
    RequestDataResult = "REQUEST_DATA_RESULT"
}

export interface StartSimulationEvent {
    type: SimulationWorkerEventType.StartSimulation,
    simulation: Simulation,
    simulationType: SimulationType
}

export interface StopSimulationEvent {
    type: SimulationWorkerEventType.StopSimulation
}

export interface RequestResultSimulationEvent {
    type: SimulationWorkerEventType.RequestResult
}

export interface RequestDataResultSimulationEvent {
    type: SimulationWorkerEventType.RequestDataResult,
    maxDataPoints: number,
    minimumDistance?: number
}

export type SimulationWorkerEvent = StartSimulationEvent
    | StopSimulationEvent
    | RequestResultSimulationEvent
    | RequestDataResultSimulationEvent
