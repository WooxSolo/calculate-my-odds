import { SimulationResult } from "../../shared/interfaces/simulation/SimulationResult";

export interface Simulator {
    start: () => void,
    pause: () => void,
    getResult: () => SimulationResult
}

export interface DataSimulator extends Simulator {
    getTruncatedResult: (maxDataPoints: number, minimumDistance?: number) => SimulationResult
}
