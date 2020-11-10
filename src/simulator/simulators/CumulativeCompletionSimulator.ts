import { Simulation } from "../../shared/interfaces/simulation/Simulation";
import { DataSimulationResult, SimulationDataPoint, SimulationResultType } from "../../shared/interfaces/simulation/SimulationResult";
import { calculatePrefixSum, getTruncatedArrayItems } from "../helpers/ArrayHelpers";
import { simulationLoop } from "../helpers/LoopHelper";
import { isInRange } from "../helpers/NumberHelper";
import { checkGoalCompletion, groupGoals } from "../helpers/SimulationHelpers";
import { DataSimulator, Simulator } from "./Simulator";

export class CumulativeCompletionSimulator implements DataSimulator {
    private isRunning: boolean;
    private simulation: Simulation;
    private iterations: number;
    private result: number[];
    
    constructor(simulation: Simulation) {
        this.isRunning = false;
        this.simulation = simulation;
        this.iterations = 0;
        this.result = [];
    }
    
    private simulateCumulative() {
        const probabilities = this.simulation.probabilities;
        const goals = this.simulation.goals;
        
        let fulfilledGoals = 0;
        const counts = new Int32Array(probabilities.length);
        for (const goal of goals) {
            if (checkGoalCompletion(0, goal)) {
                fulfilledGoals++;
            }
        }
        const groupedGoals = groupGoals(probabilities, goals);
        let attempts = 0;
        
        while (fulfilledGoals < goals.length) {
            const roll = Math.random();
            let nextCheckBase = 0;
            for (let i = 0; i < probabilities.length; i++) {
                const item = probabilities[i];
                const check = nextCheckBase + item.probability!;
                if (roll < check) {
                    for (const goal of groupedGoals[i]) {
                        const completedBefore = checkGoalCompletion(counts[i], goal);
                        const completedAfter = checkGoalCompletion(counts[i] + 1, goal);
                        if (!completedBefore && completedAfter) {
                            fulfilledGoals++;
                        }
                        else if (completedBefore && !completedAfter) {
                            // TODO: Notify that the simulation will never finish
                            throw new Error();
                        }
                    }
                    counts[i]++;
                    break;
                }
                nextCheckBase = check;
            }
            
            attempts++;
        }
        
        // TODO: Maybe change this at some point to ensure the
        // array doesn't take up too much space in case
        // reaching the goal can take very many attempts
        while (this.result.length <= attempts) {
            this.result.push(0);
        }
        this.result[attempts]++;
        this.iterations++;
    }
    
    start() {
        this.isRunning = true;
        
        simulationLoop(() => {
            this.simulateCumulative();
            return this.isRunning;
        });
    }
    
    pause() {
        this.isRunning = false;
    }

    getResult() {
        const result: DataSimulationResult = {
            type: SimulationResultType.DataResult,
            iterations: this.iterations,
            dataPoints: calculatePrefixSum(this.result).map((x, index) => ({
                completions: index,
                probability: x / this.iterations
            }))
        };
        return result;
    }
    
    getTruncatedResult(maxDataPoints: number, minimumDistance?: number) {
        debugger;
        let resultArray = calculatePrefixSum(this.result).map(x => x / this.iterations);
        if (minimumDistance !== undefined) {
            while (resultArray.length > 0 && !isInRange(resultArray[resultArray.length - 1], minimumDistance, 1 - minimumDistance)) {
                resultArray.pop();
            }
        }
        let dataPoints = resultArray.map((x, index) => ({
            completions: index,
            probability: x
        } as SimulationDataPoint));
        dataPoints = getTruncatedArrayItems(dataPoints, maxDataPoints);
        
        const result: DataSimulationResult = {
            type: SimulationResultType.DataResult,
            iterations: this.iterations,
            dataPoints: dataPoints
        };
        return result;
    }
}
