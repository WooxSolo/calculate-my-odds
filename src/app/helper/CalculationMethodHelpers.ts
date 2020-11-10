import { CalculationMethod, CalculationMethodType } from "../../shared/interfaces/CalculationMethods";

export const calculationMethods: CalculationMethod[] = [
    {
        type: CalculationMethodType.Simulation,
        name: "Simulation"
    },
    {
        type: CalculationMethodType.Calculation,
        name: "State based calculation"
    }
];
