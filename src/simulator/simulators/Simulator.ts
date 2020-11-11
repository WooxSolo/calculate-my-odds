import { Simulation } from "../../shared/interfaces/simulation/Simulation";
import { DataSimulationResult, SimulationResultType } from "../../shared/interfaces/simulation/SimulationResult";
import { runWorkerLoop } from "../../shared/helpers/LoopHelper";
import { calculateProbabilityArray, checkGoalCompletion, groupGoals } from "../helpers/SimulationHelpers";
import { DynamicInt64Array } from "../../shared/data-structures/DynamicInt64Array";
import { getTruncatedData } from "../../shared/helpers/CalculationHelper";

export class Simulator {
    private isRunning: boolean;
    private simulation: Simulation;
    private iterations: number;
    private attempts: number;
    private result: DynamicInt64Array;
    
    constructor(simulation: Simulation) {
        this.isRunning = false;
        this.simulation = simulation;
        this.iterations = 0;
        this.attempts = 0;
        this.result = new DynamicInt64Array();
    }
    
    private simulateRound() {
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
            this.result.push(BigInt(0));
        }
        this.result.set(attempts, this.result.get(attempts) + BigInt(1));
        this.iterations++;
        this.attempts += attempts;
    }
    
    start() {
        this.isRunning = true;
        
        runWorkerLoop(() => {
            this.simulateRound();
            return this.isRunning;
        });
    }
    
    pause() {
        this.isRunning = false;
    }

    getResult(maxDataPoints: number, minimumDistance?: number) {
        const probabiliyArray = calculateProbabilityArray(this.result, this.iterations);
        const dataPoints = getTruncatedData(probabiliyArray, maxDataPoints, minimumDistance)
            .map(x => ({
                completions: x.index,
                probability: x.value
            }));

        const result: DataSimulationResult = {
            type: SimulationResultType.DataResult,
            iterations: this.iterations,
            attempts: this.attempts,
            dataPoints: dataPoints
        };
        return result;
    }
    
    destroy() {
        this.isRunning = false;
    }
}
