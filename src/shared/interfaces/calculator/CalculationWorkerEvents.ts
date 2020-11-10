import { Calculation, CalculationType } from "./Calculation";

export enum CalculationWorkerEventType {
    StartCalculation = "START_CALCULATION",
    StopCalculation = "STOP_CALCULATION",
    RequestSimpleResult = "REQUEST_SIMPLE_RESULT",
    RequestDataResult = "REQUEST_DATA_RESULT"
}

export interface StartCalculationEvent {
    type: CalculationWorkerEventType.StartCalculation,
    calculation: Calculation,
    calculationType: CalculationType
}

export interface StopCalculationEvent {
    type: CalculationWorkerEventType.StopCalculation
}

export interface RequestSimpleResultCalculationEvent {
    type: CalculationWorkerEventType.RequestSimpleResult
}

export interface RequestDataResultCalculationEvent {
    type: CalculationWorkerEventType.RequestDataResult,
    maxDataPoints: number,
    minimumDistance?: number
}

export type CalculationWorkerEvent = StartCalculationEvent
    | StopCalculationEvent
    | RequestSimpleResultCalculationEvent
    | RequestDataResultCalculationEvent
