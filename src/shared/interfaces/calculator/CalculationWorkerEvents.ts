import { Calculation } from "./Calculation";

export enum CalculationWorkerEventType {
    StartCalculation = "START_CALCULATION",
    StopCalculation = "STOP_CALCULATION",
    RequestDataResult = "REQUEST_DATA_RESULT"
}

export interface StartCalculationEvent {
    type: CalculationWorkerEventType.StartCalculation,
    calculation: Calculation
}

export interface StopCalculationEvent {
    type: CalculationWorkerEventType.StopCalculation
}

export interface RequestDataResultCalculationEvent {
    type: CalculationWorkerEventType.RequestDataResult,
    maxDataPoints: number,
    minimumDistance?: number
}

export type CalculationWorkerEvent = StartCalculationEvent
    | StopCalculationEvent
    | RequestDataResultCalculationEvent
