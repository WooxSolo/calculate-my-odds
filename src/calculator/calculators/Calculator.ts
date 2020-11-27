import { Calculation } from "../../shared/interfaces/calculator/Calculation";
import { CalculationDataPoint, CalculationResultType, DataCalculationResult } from "../../shared/interfaces/calculator/CalculationResult";
import { runWorkerLoop } from "../../shared/helpers/LoopHelper";
import { DynamicFloat64Array } from "../../shared/data-structures/DynamicFloat64Array";
import { CalculationFailureNode, CalculationGoalNode, CalculationTable, State } from "../interfaces/CalculationInterfaces";
import { parseState, serializeState, buildCalculationGoals, buildCalculationTables, buildCalculationFailure, findCalculationItemIndicesForGoals, findCalculationItemIndicesForFailures, buildCalculationGoalsMaxCountsFromGoals, buildCalculationGoalsMaxCountsFromFailures } from "../helpers/CalculationHelpers";
import { binarySearchIntegerInc } from "../../shared/helpers/BinarySearchHelpers";
import { ProbabilityType } from "../../shared/interfaces/Probability";

interface SimulationResult {
    average: number,
    completionRate: number,
    result: DynamicFloat64Array
}

const MAX_ITERATIONS = 10 * 1000 * 1000;

export class Calculator {
    private calculation: Calculation;
    private isRunning: boolean;
    private successResult: SimulationResult;
    private failureResult: SimulationResult;
    private drawResult: SimulationResult;
    private lastStates: Map<string, number>;
    private onCompletion?: () => void;
    private targetIterationsAtProbability: number;
    private targetProbabilityAtIterations: number;
    
    constructor(calculation: Calculation,
            iterationsAtProbability: number,
            probabilityAtIterations: number,
            onCompletion?: () => void) {
        this.isRunning = false;
        this.calculation = calculation;
        this.successResult = {
            result: new DynamicFloat64Array(),
            average: 0,
            completionRate: 0
        };
        this.failureResult = {
            result: new DynamicFloat64Array(),
            average: 0,
            completionRate: 0
        };
        this.drawResult = {
            result: new DynamicFloat64Array(),
            average: 0,
            completionRate: 0
        };
        this.lastStates = new Map<string, number>();
        this.targetIterationsAtProbability = iterationsAtProbability;
        this.targetProbabilityAtIterations = probabilityAtIterations;
        this.onCompletion = onCompletion;
    }
    
    private nextStateCalculation(tables: CalculationTable[], maxCounts: Int32Array) {
        let states = this.lastStates;
        
        for (const table of tables) {
            for (let rollNumber = 0; rollNumber < table.rollsPerIteration; rollNumber++) {
                const nextStates = new Map<string, number>();
                const nothingProbability = 1 - table.items.reduce((a, item) => {
                    return a + item.probability;
                }, 0);
                    
                for (const stateEntry of states) {
                    for (const item of table.items) {
                        const state = parseState(stateEntry[0]);
                        const nextState = new Int32Array(state);
                        nextState[item.index] = Math.min(maxCounts[item.index], nextState[item.index] + 1);
                        const serializedState = serializeState(nextState);
                        
                        const prevProbability = nextStates.get(serializedState) ?? 0;
                        const nextProbability = stateEntry[1] * item.probability;
                        if (prevProbability + nextProbability > 0) {
                            nextStates.set(serializedState, prevProbability + nextProbability);
                        }
                    }
                    
                    const prevNothingProbability = nextStates.get(stateEntry[0]) ?? 0;
                    const nextNothingProbability = stateEntry[1] * nothingProbability;
                    if (prevNothingProbability + nextNothingProbability > 0) {
                        nextStates.set(stateEntry[0], prevNothingProbability + nextNothingProbability);
                    }
                }
                
                states = nextStates;
            }
        }
        
        this.lastStates = states;
    }
    
    private updateCompletionRates(rootGoal: CalculationGoalNode, rootFailure: CalculationFailureNode) {
        for (const stateEntry of this.lastStates) {
            const state = parseState(stateEntry[0]);
            const success = rootGoal.isCompleted(state);
            const failure = rootFailure.hasFailed(state);
            if (success && failure) {
                this.drawResult.completionRate += stateEntry[1];
                this.lastStates.delete(stateEntry[0]);
            }
            else if (success) {
                this.successResult.completionRate += stateEntry[1];
                this.lastStates.delete(stateEntry[0]);
            }
            else if (failure) {
                this.failureResult.completionRate += stateEntry[1];
                this.lastStates.delete(stateEntry[0]);
            }
        }
        
        this.successResult.result.push(this.successResult.completionRate);
        this.failureResult.result.push(this.failureResult.completionRate);
        this.drawResult.result.push(this.drawResult.completionRate);
    }
    
    private updateAverage(result: SimulationResult) {
        const v1 = result.result.get(result.result.length - 1);
        const v2 = result.result.get(result.result.length - 2);
        const probability = v1 - v2;
        result.average += probability * (result.result.length - 1);
    }
    
    start() {
        this.isRunning = true;
        
        const tables = this.calculation.tables;
        const rootGoal = this.calculation.rootGoal;
        const rootFailure = this.calculation.rootFailure;
        
        const itemNameToIndexMap = new Map<string, number>();
        findCalculationItemIndicesForGoals(rootGoal, itemNameToIndexMap);
        findCalculationItemIndicesForFailures(rootFailure, itemNameToIndexMap);
        const maxCounts = new Int32Array(itemNameToIndexMap.size);
        const calcRootGoal = buildCalculationGoals(rootGoal, itemNameToIndexMap);
        const calcRootFailure = buildCalculationFailure(rootFailure, itemNameToIndexMap);
        const calcTables = buildCalculationTables(tables, itemNameToIndexMap);
        buildCalculationGoalsMaxCountsFromGoals(rootGoal, itemNameToIndexMap, maxCounts);
        buildCalculationGoalsMaxCountsFromFailures(rootFailure, itemNameToIndexMap, maxCounts);
        
        if (this.lastStates.size === 0) {
            const initialState: State = new Int32Array(maxCounts.length);
            this.lastStates.set(serializeState(initialState), 1);
        }
        
        this.updateCompletionRates(calcRootGoal, calcRootFailure);
        
        runWorkerLoop(() => {
            this.nextStateCalculation(calcTables, maxCounts);
            this.updateCompletionRates(calcRootGoal, calcRootFailure);
            this.updateAverage(this.successResult);
            this.updateAverage(this.failureResult);
            this.updateAverage(this.drawResult);

            // TODO: Change 0.999999 to be a constant and make it closer to 1
            const completionRate = this.successResult.completionRate + this.failureResult.completionRate + this.drawResult.completionRate;
            if (completionRate >= 0.999999) {
                this.onCompletion?.();
                return false;
            }
            
            return this.isRunning;
        });
    }
    
    pause() {
        this.isRunning = false;
    }
    
    private findHighIteration(highestIteration: number, threshold?: number) {
        let highIteration = binarySearchIntegerInc(0, highestIteration, mid => {
            const v1 = this.successResult.result.get(mid);
            const v2 = this.failureResult.result.get(mid);
            const v3 = this.drawResult.result.get(mid);
            return v1 + v2 + v3 >= (threshold ?? 1);
        });
        return Math.min(highIteration, highestIteration);
    }
    
    getResult(maxDataPoints: number, threshold?: number) {
        const iterations = this.successResult.result.length - 1;
        
        const highIterationIndex = threshold ? this.findHighIteration(iterations, threshold) : iterations;
        
        const successDataPoints = this.successResult.result.getTruncatedArray(maxDataPoints, highIterationIndex)
            .map(x => ({
                completions: x.index,
                probability: x.value
            } as CalculationDataPoint));
        const failureDataPoints = this.failureResult.result.getTruncatedArray(maxDataPoints, highIterationIndex)
            .map(x => ({
                completions: x.index,
                probability: x.value
            } as CalculationDataPoint));
        const drawDataPoints = this.drawResult.result.getTruncatedArray(maxDataPoints, highIterationIndex)
            .map(x => ({
                completions: x.index,
                probability: x.value
            } as CalculationDataPoint));
            
        const result: DataCalculationResult = {
            type: CalculationResultType.DataResult,
            totalIterations: this.successResult.result.length - 1,
            successResult: {
                average: this.successResult.average,
                completionRate: this.successResult.completionRate,
                dataPoints: successDataPoints,
                probabilityAtIterations: this.internalGetProbabilityAtIterations(this.successResult),
                iterationsAtProbability: this.internalGetIterationsAtProbability(this.successResult)
            },
            failureResult: {
                average: this.failureResult.average,
                completionRate: this.failureResult.completionRate,
                dataPoints: failureDataPoints,
                probabilityAtIterations: this.internalGetProbabilityAtIterations(this.failureResult),
                iterationsAtProbability: this.internalGetIterationsAtProbability(this.failureResult)
            },
            drawResult: {
                average: this.drawResult.average,
                completionRate: this.drawResult.completionRate,
                dataPoints: drawDataPoints,
                probabilityAtIterations: this.internalGetProbabilityAtIterations(this.drawResult),
                iterationsAtProbability: this.internalGetIterationsAtProbability(this.drawResult)
            }
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
        return result.result.get(index);
    }
    
    private internalGetIterationsAtProbability(result: SimulationResult) {
        const iterations = binarySearchIntegerInc(0, result.result.length - 1, mid => {
            return result.result.get(mid) >= this.targetIterationsAtProbability;
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
