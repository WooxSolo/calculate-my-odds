import { CalculationMethod } from "./CalculationMethods";
import { ProbabilityGoal } from "./Goals";
import { ProbabilityItem } from "./Probability";

export interface StartSimulationEvent {
    type: "START_SIMULATION"
    simulation: Simulation
}

export interface Simulation {
    probabilities: ProbabilityItem[],
    goals: ProbabilityGoal[],
    calculationMethod: CalculationMethod
}

export interface StopSimulationEvent {
    type: "STOP_SIMULATION"
}

export interface RequestResultSimulationEvent {
    type: "REQUEST_RESULT"
}

export type SimulationWorkerEvent = StartSimulationEvent
    | StopSimulationEvent
    | RequestResultSimulationEvent

export interface AverageSimulationResult {
    type: "AVERAGE_RESULT",
    iterations: number,
    totalAttempts: number
}    

export type SimulationResult = AverageSimulationResult

export interface ReceivedResultSimulationEvent {
    type: "RECEIVED_RESULT",
    result?: SimulationResult
}

export type SimulationMainEvent = ReceivedResultSimulationEvent
