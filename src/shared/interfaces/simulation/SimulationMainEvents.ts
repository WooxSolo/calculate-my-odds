import { SimulationType } from "./Simulation";
import { SimulationResult } from "./SimulationResult";

export enum SimulationMainEventTypes {
    ReceivedResult = "RECEIVED_RESULT"
}

export interface ReceivedResultSimulationEvent {
    type: SimulationMainEventTypes.ReceivedResult,
    result?: SimulationResult
}

export type SimulationMainEvent = ReceivedResultSimulationEvent
