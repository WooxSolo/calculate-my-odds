import { CalculationResult } from "./CalculationResult";

export enum CalculationMainEventTypes {
    ReceivedResult = "RECEIVED_RESULT"
}

export interface ReceivedResultCalculationEvent {
    type: CalculationMainEventTypes.ReceivedResult,
    result?: CalculationResult
}

export type CalculationMainEvent = ReceivedResultCalculationEvent
