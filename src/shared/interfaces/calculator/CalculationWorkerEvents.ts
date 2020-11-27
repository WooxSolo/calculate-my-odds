import { Calculation } from "./Calculation";

export enum CalculationWorkerEventType {
    StartCalculation = "START_CALCULATION",
    PauseCalculation = "PAUSE_CALCULATION",
    ResumeCalculation = "RESUME_CALCULATION",
    CancelCalculation = "CANCEL_CALCULATION",
    RequestDataResult = "REQUEST_DATA_RESULT",
    RequestProbabilityAtIterations = "REQUEST_PROBABILITY_AT_ITERATIONS",
    RequestIterationsAtProbability = "REQUEST_ITERATIONS_AT_PROBABILITY"
}

export interface StartCalculationEvent {
    type: CalculationWorkerEventType.StartCalculation,
    calculation: Calculation,
    initialProbabilityAtIterations: number,
    initialIterationsAtProbability: number
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
    requestId: number,
    maxDataPoints: number,
    threshold?: number
}

export interface RequestCalculatorProbabilityAtIterations {
    type: CalculationWorkerEventType.RequestProbabilityAtIterations,
    iterations: number
}

export interface RequestCalculatorIterationsAtProbability {
    type: CalculationWorkerEventType.RequestIterationsAtProbability,
    probability: number
}

export type CalculationWorkerEvent = StartCalculationEvent
    | PauseCalculationEvent
    | ResumeCalculationEvent
    | CancelCalculationEvent
    | RequestDataResultCalculationEvent
    | RequestCalculatorProbabilityAtIterations
    | RequestCalculatorIterationsAtProbability
