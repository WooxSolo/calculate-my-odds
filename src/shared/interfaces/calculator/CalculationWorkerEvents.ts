import { Calculation } from "./Calculation";

export enum CalculationWorkerEventType {
    StartCalculation = "START_CALCULATION",
    PauseCalculation = "PAUSE_CALCULATION",
    ResumeCalculation = "RESUME_CALCULATION",
    CancelCalculation = "CANCEL_CALCULATION",
    RequestDataResult = "REQUEST_DATA_RESULT"
}

export interface StartCalculationEvent {
    type: CalculationWorkerEventType.StartCalculation,
    calculation: Calculation
}

export interface PauseCalculationEvent {
    type: CalculationWorkerEventType.PauseCalculation
}

export interface ResumeCalculationEvent {
    type: CalculationWorkerEventType.ResumeCalculation
}

export interface CancelCalculationEvent {
    type: CalculationWorkerEventType.CancelCalculation
}

export interface RequestDataResultCalculationEvent {
    type: CalculationWorkerEventType.RequestDataResult,
    maxDataPoints: number,
    minimumDistance?: number
}

export type CalculationWorkerEvent = StartCalculationEvent
    | PauseCalculationEvent
    | ResumeCalculationEvent
    | CancelCalculationEvent
    | RequestDataResultCalculationEvent
