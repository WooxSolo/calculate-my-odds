import { runWorkerLoop } from "../../shared/helpers/LoopHelper";
import { Calculation } from "../../shared/interfaces/calculator/Calculation";
import { AverageCalculationResult, CalculationResultType } from "../../shared/interfaces/calculator/CalculationResult";
import { Calculator } from "./Calculator";

export class AverageCalculator implements Calculator {
    private result: AverageCalculationResult;
    private calculation: Calculation;
    private isRunning: boolean;
    
    constructor(calculation: Calculation) {
        this.isRunning = false;
        this.result = {
            type: CalculationResultType.AverageResult, 
            iterations: 0,
            totalAttempts: 0
        };
        this.calculation = calculation;
    }
    
    start() {
        this.isRunning = true;
        
        runWorkerLoop(() => {
            
            
            return this.isRunning;
        });
    }
    
    pause() {
        this.isRunning = false;
    }
    
    getResult() {
        return this.result;
    }
    
    destroy() {
        this.isRunning = false;
    }
}
