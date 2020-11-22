import { Simulation } from "../../shared/interfaces/simulation/Simulation";
import { DataSimulationResult, SimulationResultType } from "../../shared/interfaces/simulation/SimulationResult";
import { runWorkerLoop } from "../../shared/helpers/LoopHelper";
import { calculateProbabilityArray, checkGoalCompletion, checkGoalFailure, groupGoals } from "../helpers/SimulationHelpers";
import { DynamicInt64Array } from "../../shared/data-structures/DynamicInt64Array";
import { getTruncatedData } from "../../shared/helpers/CalculationHelper";
import { uniqBy } from "lodash";
import { ProbabilityGoal } from "../../shared/interfaces/Goals";
import { ProbabilityItem } from "../../shared/interfaces/Probability";

export class Simulator {
    private isRunning: boolean;
    private simulation: Simulation;
    private iterations: number;
    private attempts: number;
    private successfulIterations: number;
    private result: DynamicInt64Array; // TODO: Limit size to maybe 10m to prevent too much memory allocation
    private targetIterationsAtProbability: number;
    private targetProbabilityAtIterations: number;
    
    constructor(simulation: Simulation, iterationsAtProbability: number,
            probabilityAtIterations: number) {
        this.isRunning = false;
        this.simulation = simulation;
        this.iterations = 0;
        this.attempts = 0;
        this.successfulIterations = 0;
        this.result = new DynamicInt64Array();
        this.targetIterationsAtProbability = iterationsAtProbability;
        this.targetProbabilityAtIterations = probabilityAtIterations;
    }
    
    private simulateRound(targetItems: ProbabilityItem[], groupedGoals: ProbabilityGoal[][][], itemToIndexMap: Map<string, number>) {
        const tables = this.simulation.tables;
        const goals = this.simulation.goals;
        
        let fulfilledGoals = 0;
        const counts = new Int32Array(targetItems.length);
        for (const goal of goals) {
            if (checkGoalCompletion(0, goal)) {
                fulfilledGoals++;
            }
        }
        let attempts = 0;
        let success = true;
        
        // TODO: Maybe add some function to not have the code below so deeply nested
        
        while (success && fulfilledGoals < goals.length) {
            for (let tableIndex = 0; tableIndex < tables.length; tableIndex++) {
                const table = tables[tableIndex];
                for (let rollNum = 0; rollNum < table.rollsPerIteration!; rollNum++) {
                    const roll = Math.random();
                    let nextCheckBase = 0;
                    for (let i = 0; i < table.items.length; i++) {
                        const item = table.items[i];
                        const check = nextCheckBase + item.probability!;
                        if (roll < check) {
                            const index = itemToIndexMap.get(item.id);
                            if (index !== undefined) {
                                for (const goal of groupedGoals[tableIndex][i]) {
                                    const completedBefore = checkGoalCompletion(counts[index], goal);
                                    const completedAfter = checkGoalCompletion(counts[index] + 1, goal);
                                    if (!completedBefore && completedAfter) {
                                        fulfilledGoals++;
                                    }
                                    else if (completedBefore && !completedAfter) {
                                        fulfilledGoals--;
                                    }
                                    success = success && !checkGoalFailure(counts[index] + 1, goal);
                                }
                                counts[index]++;
                            }
                            break;
                        }
                        nextCheckBase = check;
                    }
                }
            }
            
            attempts++;
        }
        
        this.iterations++;
        if (success) {
            // TODO: Maybe change this at some point to ensure the
            // array doesn't take up too much space in case
            // reaching the goal can take very many attempts
            while (this.result.length <= attempts) {
                this.result.push(BigInt(0));
            }
            this.result.set(attempts, this.result.get(attempts) + BigInt(1));
            this.attempts += attempts;
            this.successfulIterations++;
        }
    }
    
    start() {
        this.isRunning = true;
        
        const goals = this.simulation.goals;
        const tables = this.simulation.tables;
        
        const targetItems = uniqBy(goals.map(x => x.item!), x => x.id);
        const groupedGoals = groupGoals(tables, goals);
        const itemToIndexMap = new Map<string, number>(targetItems.map((x, index) => [x.id, index]));
        
        runWorkerLoop(() => {
            this.simulateRound(targetItems, groupedGoals, itemToIndexMap);
            return this.isRunning;
        });
    }
    
    pause() {
        this.isRunning = false;
    }

    getResult(maxDataPoints: number, minimumDistance?: number) {
        // TODO: This can be slow when this.result is large
        // Probably need some data structure like binary indexed tree to improve speed
        
        const probabilityArray = calculateProbabilityArray(this.result, this.successfulIterations);
        const dataPoints = getTruncatedData(probabilityArray, maxDataPoints, minimumDistance)
            .map(x => ({
                completions: x.index,
                probability: x.value
            }));

        const result: DataSimulationResult = {
            type: SimulationResultType.DataResult,
            iterations: this.iterations,
            attempts: this.attempts,
            successfulIterations: this.successfulIterations,
            dataPoints: dataPoints,
            iterationsAtProbability: this.getIterationsAtProbability(),
            probabilityAtIterations: this.getProbabilityAtIterations(),
            highestIteration: this.result.length - 1
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
        if (this.successfulIterations === 0) {
            return 0;
        }
        
        const targetIterations = this.targetProbabilityAtIterations;
        let completions = 0;
        for (let i = 0; i <= Math.min(targetIterations, this.result.length - 1); i++) {
            completions += Number(this.result.get(i));
        }
        return completions / this.successfulIterations;
    }
    
    getIterationsAtProbability() {
        const targetProbability = this.targetIterationsAtProbability;
        let completions = 0;
        let iterations = 0;
        while (iterations < this.result.length) {
            completions += Number(this.result.get(iterations));
            if (completions / this.successfulIterations >= targetProbability) {
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
