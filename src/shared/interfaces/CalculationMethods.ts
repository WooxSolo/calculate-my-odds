
export enum CalculationMethodType {
    Simulation = "SIMULATION",
    Calculation = "CALCULATION"
}

export interface CalculationMethod {
    type: CalculationMethodType,
    name: string
}
