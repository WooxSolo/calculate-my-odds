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
    private result: DynamicInt64Array; // TODO: Limit size to maybe 10m to prevent too much memory allocation
    private targetIterationsAtProbability: number;
    private targetProbabilityAtIterations: number;
    
    constructor(simulation: Simulation, iterationsAtProbability: number,
            probabilityAtIterations: number) {
        this.isRunning = false;
        this.simulation = simulation;
        this.iterations = 0;
        this.attempts = 0;
        this.result = new DynamicInt64Array();
        this.targetIterationsAtProbability = iterationsAtProbability;
        this.targetProbabilityAtIterations = probabilityAtIterations;
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
                            fulfilledGoals--;
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
        // TODO: This can be slow when this.result is large
        // Probably need some data structure like binary indexed tree to improve speed
        
        const probabilityArray = calculateProbabilityArray(this.result, this.iterations);
        const dataPoints = getTruncatedData(probabilityArray, maxDataPoints, minimumDistance)
            .map(x => ({
                completions: x.index,
                probability: x.value
            }));

        const result: DataSimulationResult = {
            type: SimulationResultType.DataResult,
            iterations: this.iterations,
            attempts: this.attempts,
            dataPoints: dataPoints,
            iterationsAtProbability: this.getIterationsAtProbability(),
            probabilityAtIterations: this.getProbabilityAtIterations()
        };
        return result;
    }
    
    updateProbabilityAtIterationsTarget(iterations: number) {
        this.targetProbabilityAtIterations = iterations;
    }
    
    updateIterationsAtProbabilityTarget(probability: number) {
        this.targetIterationsAtProbability = probability;
    }
    
    getProbabilityAtIterations() {
        const targetIterations = this.targetProbabilityAtIterations;
        let completions = 0;
        for (let i = 0; i <= Math.min(targetIterations, this.result.length - 1); i++) {
            completions += Number(this.result.get(i));
        }
        return completions / this.iterations;
    }
    
    getIterationsAtProbability() {
        const targetProbability = this.targetIterationsAtProbability;
        let completions = 0;
        let iterations = 0;
        while (iterations < this.result.length) {
            completions += Number(this.result.get(iterations));
            if (completions / this.iterations >= targetProbability) {
                return iterations;
            }
            iterations++;
        }
        return iterations;
    }
    
    destroy() {
        this.isRunning = false;
    }
}
