import { CalculationResult } from "./CalculationResult";

export enum CalculationMainEventTypes {
    ReceivedResult = "RECEIVED_RESULT",
    FinishedCalculation = "FINISHED_CALCULATION"
}

export interface ReceivedResultCalculationEvent {
    type: CalculationMainEventTypes.ReceivedResult,
    result?: CalculationResult
}

export interface FinishedCalculationEvent {
    type: CalculationMainEventTypes.FinishedCalculation
}

export type CalculationMainEvent = ReceivedResultCalculationEvent
    | FinishedCalculationEvent
