import { CalculationResult } from "../../shared/interfaces/calculator/CalculationResult";

export interface Calculator {
    start: () => void,
    pause: () => void,
    getResult: () => CalculationResult,
    destroy: () => void
}

export interface DataCalculator extends Calculator {
    getTruncatedResult: (maxDataPoints: number, minimumDistance?: number) => CalculationResult
}
