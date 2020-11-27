import { Simulation } from "../../shared/interfaces/simulation/Simulation";
import { DataSimulationResult, SimulationResultType } from "../../shared/interfaces/simulation/SimulationResult";
import { runWorkerLoop } from "../../shared/helpers/LoopHelper";
import { buildSimulationFailure, buildSimulationGoals, buildSimulationTables, findSimulationGoalItemEffects, findSimulationFailureItemEffects } from "../helpers/SimulationHelpers";
import { DynamicInt64Array } from "../../shared/data-structures/DynamicInt64Array";
import { AnyProbabilityGoal } from "../../shared/interfaces/Goals";
import { SimulationFailureNode, SimulationGoalNode, SimulationItemEffect, SimulationTable } from "../interfaces/SimulationInterfaces";
import { AnyProbabilityFailure } from "../../shared/interfaces/Failures";
import { getTruncatedArrayItems } from "../helpers/ArrayHelpers";
import { binarySearchIntegerInc } from "../../shared/helpers/BinarySearchHelpers";
import { ProbabilityType } from "../../shared/interfaces/Probability";

interface SimulationResult {
    totalAttempts: number,
    successfulRounds: number,
    result: DynamicInt64Array,
}

const MAX_ITERATIONS = 10 * 1000 * 1000;

export class Simulator {
    private isRunning: boolean;
    private simulation: Simulation;
    private totalRounds: number;
    private successResult: SimulationResult;
    private failureResult: SimulationResult;
    private drawResult: SimulationResult;
    private unknownResults: number;
    private targetIterationsAtProbability: number;
    private targetProbabilityAtIterations: number;
    private simulationRounds?: number;
    private onFinish?: () => void;
    
    constructor(simulation: Simulation, iterationsAtProbability: number,
            probabilityAtIterations: number, simulationRounds?: number, onFinish?: () => void) {
        this.isRunning = false;
        this.simulation = simulation;
        this.totalRounds = 0;
        this.successResult = {
            result: new DynamicInt64Array(),
            successfulRounds: 0,
            totalAttempts: 0
        };
        this.failureResult = {
            result: new DynamicInt64Array(),
            successfulRounds: 0,
            totalAttempts: 0
        };
        this.drawResult = {
            result: new DynamicInt64Array(),
            successfulRounds: 0,
            totalAttempts: 0
        };
        this.unknownResults = 0;
        this.targetIterationsAtProbability = iterationsAtProbability;
        this.targetProbabilityAtIterations = probabilityAtIterations;
        this.simulationRounds = simulationRounds;
        this.onFinish = onFinish;
    }
    
    private incrementResult(result: SimulationResult, iterations: number) {
        result.result.ensureMinimumSize(iterations + 1);
        for (let i = 0; i < iterations; i++) {
            result.result.set(i, result.result.get(i) + BigInt(1));
        }
        result.totalAttempts += iterations;
        result.successfulRounds++;
    }
    
    private simulateRound(targetItemCount: number, rootGoal: SimulationGoalNode,
            rootFailure: SimulationFailureNode, tables: SimulationTable[]) {
        rootGoal.reset();
        rootFailure.reset();
        const counts = new Int32Array(targetItemCount);
        let iterations = 0;
        
        // TODO: Maybe add some function to not have the code below so deeply nested,
        // or maybe not since performance is valued quite highly in here
        
        while (!rootGoal.isCompleted && !rootFailure.hasFailed && iterations < MAX_ITERATIONS) {
            for (const table of tables) {
                for (let rollNum = 0; rollNum < table.rollsPerIteration; rollNum++) {
                    const roll = Math.random();
                    let nextCheckBase = 0;
                    for (let i = 0; i < table.items.length; i++) {
                        const item = table.items[i];
                        const check = nextCheckBase + item.probability!;
                        if (roll < check) {
                            counts[item.index]++;
                            for (const goal of item.impactedGoals) {
                                goal.onQuantityUpdated(counts[item.index]);
                            }
                            for (const failure of item.impactedFailures) {
                                failure.onQuantityUpdated(counts[item.index]);
                            }
                            break;
                        }
                        nextCheckBase = check;
                    }
                }
            }
            
            iterations++;
        }
        
        this.totalRounds++;
        if (rootGoal.isCompleted && rootFailure.hasFailed) {
            this.incrementResult(this.drawResult, iterations);
        }
        else if (rootGoal.isCompleted) {
            this.incrementResult(this.successResult, iterations);
        }
        else if (rootFailure.hasFailed) {
            this.incrementResult(this.failureResult, iterations);            
        }
        else {
            this.unknownResults++;
        }
    }
    
    start() {
        this.isRunning = true;
        
        const tables = this.simulation.tables;
        const rootGoal = this.simulation.rootGoal;
        const rootFailure = this.simulation.rootFailure;
        
        const targetItems = new Map<string, SimulationItemEffect>();
        const goalToSimGoalMap = new Map<AnyProbabilityGoal, SimulationGoalNode>();
        const failureToSimFailureMap = new Map<AnyProbabilityFailure, SimulationFailureNode>();
        const rootSimGoal = buildSimulationGoals(rootGoal, goalToSimGoalMap);
        const rootSimFailure = buildSimulationFailure(rootFailure, failureToSimFailureMap);
        findSimulationGoalItemEffects(rootGoal, goalToSimGoalMap, targetItems);
        findSimulationFailureItemEffects(rootFailure, failureToSimFailureMap, targetItems);
        const simTables = buildSimulationTables(tables, targetItems);
        
        runWorkerLoop(() => {
            this.simulateRound(targetItems.size, rootSimGoal, rootSimFailure, simTables);
            if (this.totalRounds === this.simulationRounds) {
                this.onFinish?.();
                this.isRunning = false;
            }
            return this.isRunning;
        });
    }
    
    pause() {
        this.isRunning = false;
    }
    
    private transformRoundsToRate(rounds: number, totalSuccessfulRounds: number) {
        if (this.totalRounds === 0) {
            return 0;
        }
        return (totalSuccessfulRounds - rounds) / this.totalRounds;
    }

    private findHighRound(highestIteration: number, threshold: number) {
        const result = binarySearchIntegerInc(0, highestIteration, mid => {
            const ix1 = Math.min(this.successResult.result.length - 1, mid);
            const ix2 = Math.min(this.failureResult.result.length - 1, mid);
            const ix3 = Math.min(this.drawResult.result.length - 1, mid);
            const v1 = ix1 < 0 ? 0 : Number(this.successResult.result.get(ix1));
            const v2 = ix2 < 0 ? 0 : Number(this.failureResult.result.get(ix2));
            const v3 = ix3 < 0 ? 0 : Number(this.drawResult.result.get(ix3));
            const sr = this.successResult.successfulRounds + this.failureResult.successfulRounds + this.drawResult.successfulRounds;
            return this.transformRoundsToRate(v1 + v2 + v3, sr) >= threshold;
        });
        return Math.min(result, highestIteration);
    }
    
    getResult(maxDataPoints: number, threshold?: number) {
        const highestIteration = Math.max(this.successResult.result.length,
            this.failureResult.result.length, this.drawResult.result.length) - 1;
            
        const highIterationIndex = threshold ? this.findHighRound(highestIteration, threshold) : highestIteration;
        
        const successDataPoints = getTruncatedArrayItems(this.successResult.result, maxDataPoints,
            Math.min(this.successResult.result.length, highIterationIndex),
            value => this.transformRoundsToRate(value, this.successResult.successfulRounds))
            .map(x => ({
                completions: x.index,
                probability: x.value
            }));
        const failureDataPoints = getTruncatedArrayItems(this.failureResult.result, maxDataPoints,
            Math.min(this.failureResult.result.length, highIterationIndex),
            value => this.transformRoundsToRate(value, this.failureResult.successfulRounds))
            .map(x => ({
                completions: x.index,
                probability: x.value
            }));
        const drawDataPoints = getTruncatedArrayItems(this.drawResult.result, maxDataPoints,
            Math.min(this.drawResult.result.length, highIterationIndex),
            value => this.transformRoundsToRate(value, this.drawResult.successfulRounds))
            .map(x => ({
                completions: x.index,
                probability: x.value
            }));
            
        const result: DataSimulationResult = {
            type: SimulationResultType.DataResult,
            totalRounds: this.totalRounds,
            successResult: {
                dataPoints: successDataPoints,
                successfulRounds: this.successResult.successfulRounds,
                totalAttempts: this.successResult.totalAttempts,
                iterationsAtProbability: this.internalGetIterationsAtProbability(this.successResult),
                probabilityAtIterations: this.internalGetProbabilityAtIterations(this.successResult)
            },
            failureResult: {
                dataPoints: failureDataPoints,
                successfulRounds: this.failureResult.successfulRounds,
                totalAttempts: this.failureResult.totalAttempts,
                iterationsAtProbability: this.internalGetIterationsAtProbability(this.failureResult),
                probabilityAtIterations: this.internalGetProbabilityAtIterations(this.failureResult)
            },
            drawResult: {
                dataPoints: drawDataPoints,
                successfulRounds: this.drawResult.successfulRounds,
                totalAttempts: this.drawResult.totalAttempts,
                iterationsAtProbability: this.internalGetIterationsAtProbability(this.drawResult),
                probabilityAtIterations: this.internalGetProbabilityAtIterations(this.drawResult)
            },
            highestIteration: highestIteration,
            unknownResults: this.unknownResults,
            maxIterations: MAX_ITERATIONS
        };
        return result;
    }
    
    updateProbabilityAtIterationsTarget(iterations: number) {
        this.targetProbabilityAtIterations = iterations;
    }
    
    updateIterationsAtProbabilityTarget(probability: number) {
        this.targetIterationsAtProbability = probability;
    }
    
    private internalGetProbabilityAtIterations(result: SimulationResult) {
        if (result.result.length === 0) {
            return 0;
        }
        
        const index = Math.min(this.targetProbabilityAtIterations, result.result.length - 1);
        return this.transformRoundsToRate(Number(result.result.get(index)), result.successfulRounds);
    }
    
    private internalGetIterationsAtProbability(result: SimulationResult) {
        const iterations = binarySearchIntegerInc(0, result.result.length - 1, mid => {
            return this.transformRoundsToRate(Number(result.result.get(mid)), result.successfulRounds) >= this.targetIterationsAtProbability;
        });
        if (iterations >= result.result.length) {
            return undefined;
        }
        return iterations;
    }
    
    getProbabilityAtIterations(type: ProbabilityType) {
        if (type === ProbabilityType.Success) {
            return this.internalGetProbabilityAtIterations(this.successResult);
        }
        if (type === ProbabilityType.Failure) {
            return this.internalGetProbabilityAtIterations(this.failureResult);
        }
        if (type === ProbabilityType.Draw) {
            return this.internalGetProbabilityAtIterations(this.drawResult);
        }
        throw new Error();
    }
    
    getIterationsAtProbability(type: ProbabilityType) {
        if (type === ProbabilityType.Success) {
            return this.internalGetIterationsAtProbability(this.successResult);
        }
        if (type === ProbabilityType.Failure) {
            return this.internalGetIterationsAtProbability(this.failureResult);
        }
        if (type === ProbabilityType.Draw) {
            return this.internalGetIterationsAtProbability(this.drawResult);
        }
        throw new Error();
    }
    
    destroy() {
        this.isRunning = false;
    }
}
