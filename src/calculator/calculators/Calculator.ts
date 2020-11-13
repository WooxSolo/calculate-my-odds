import { uniqBy } from "lodash";
import { Calculation } from "../../shared/interfaces/calculator/Calculation";
import { CalculationDataPoint, CalculationResultType, DataCalculationResult } from "../../shared/interfaces/calculator/CalculationResult";
import { ComparisonOperatorType } from "../../shared/interfaces/Compators";
import { ProbabilityGoal } from "../../shared/interfaces/Goals";
import { ProbabilityItem } from "../../shared/interfaces/Probability";
import { runWorkerLoop } from "../../shared/helpers/LoopHelper";
import { checkGoalCompletion, checkGoalFailure, groupGoals } from "../../simulator/helpers/SimulationHelpers";
import { DynamicFloat64Array } from "../../shared/data-structures/DynamicFloat64Array";
import { getTruncatedDataDynamic } from "../../shared/helpers/CalculationHelper";
import { debug } from "webpack";

type State = Int32Array

function parseState(stateString: string): State {
    return new Int32Array(stateString.split(",").map(x => parseInt(x)));
}

function serializeState(state: State) {
    return state.join(",");
}

function checkCompletion(state: State, groupedGoals: ProbabilityGoal[][]) {
    for (let i = 0; i < state.length; i++) {
        for (const goal of groupedGoals[i]) {
            if (!checkGoalCompletion(state[i], goal)) {
                return false;
            }
        }
    }
    return true;
}

function checkFailure(state: State, groupedGoals: ProbabilityGoal[][]) {
    for (let i = 0; i < state.length; i++) {
        for (const goal of groupedGoals[i]) {
            if (checkGoalFailure(state[i], goal)) {
                return true;
            }
        }
    }
    return false;
}

export class Calculator {
    private calculation: Calculation;
    private isRunning: boolean;
    private resultArray: DynamicFloat64Array;
    private lastStates: Map<string, number>;
    private average: number;
    private completionRate: number;
    private failureRate: number;
    private onCompletion?: () => void;
    private targetIterationsAtProbability: number;
    private targetProbabilityAtIterations: number;
    
    constructor(calculation: Calculation,
            iterationsAtProbability: number,
            probabilityAtIterations: number,
            onCompletion?: () => void) {
        this.isRunning = false;
        this.calculation = calculation;
        this.resultArray = new DynamicFloat64Array();
        this.lastStates = new Map<string, number>();
        this.average = 0;
        this.completionRate = 0;
        this.failureRate = 0;
        this.targetIterationsAtProbability = iterationsAtProbability;
        this.targetProbabilityAtIterations = probabilityAtIterations;
        this.onCompletion = onCompletion;
    }
    
    private nextStateCalculation(probabilities: ProbabilityItem[], maxCounts: Int32Array) {
        const states = this.lastStates;
        
        const nextStates = new Map<string, number>();
        for (const stateEntry of states) {
            const state = parseState(stateEntry[0]);
            for (let i = 0; i < probabilities.length; i++) {
                const item = probabilities[i];
                const nextState = new Int32Array(state);
                if (nextState[i] < maxCounts[i]) {
                    nextState[i]++;
                }
                const serializedState = serializeState(nextState);
                const prevProbability = nextStates.get(serializedState) ?? 0;
                const nextProbability = stateEntry[1] * item.probability!;
                if (prevProbability + nextProbability > 0) {
                    nextStates.set(serializedState, prevProbability + nextProbability);
                }
            }
            
            const nothingProbability = 1 - probabilities.reduce((a, b) => a + b.probability!, 0);
            const prevNothingProbability = nextStates.get(stateEntry[0]) ?? 0;
            const nextNothingProbability = stateEntry[1] * nothingProbability;
            if (prevNothingProbability + nextNothingProbability > 0) {
                nextStates.set(stateEntry[0], prevNothingProbability + nextNothingProbability);
            }
        }
        
        this.lastStates = nextStates;
    }
    
    private updateCompletionRate(groupedGoals: ProbabilityGoal[][]) {
        for (const stateEntry of this.lastStates) {
            if (checkCompletion(parseState(stateEntry[0]), groupedGoals)) {
                this.completionRate += stateEntry[1];
                this.lastStates.delete(stateEntry[0]);
            }
        }
        this.resultArray.push(this.completionRate);
    }
    
    private updateFailureRate(groupedGoals: ProbabilityGoal[][]) {
        for (const stateEntry of this.lastStates) {
            const state = parseState(stateEntry[0]);
            if (checkFailure(state, groupedGoals)) {
                this.failureRate += stateEntry[1];
                this.lastStates.delete(stateEntry[0]);
            }
        }
    }
    
    private updateAverage() {
        if (this.resultArray.length < 2) {
            return;
        }
        
        const v1 = this.resultArray.get(this.resultArray.length - 1);
        const v2 = this.resultArray.get(this.resultArray.length - 2);
        const probability = v1 - v2;
        this.average += probability * (this.resultArray.length - 1);
    }
    
    start() {
        this.isRunning = true;
        
        const probabilities = uniqBy(this.calculation.goals.map(x => x.item!), x => x.id);
        const groupedGoals = groupGoals(this.calculation.probabilities, this.calculation.goals);
        const maxCounts = new Int32Array(probabilities.length);
        for (let i = 0; i < groupedGoals.length; i++) {
            for (const goal of groupedGoals[i]) {
                switch (goal.comparator.type) {
                    case ComparisonOperatorType.GreaterOrEquals:
                    case ComparisonOperatorType.LessThan: {
                        maxCounts[i] = Math.max(maxCounts[i], goal.targetCount!);
                        break;
                    }
                    case ComparisonOperatorType.GreaterThan:
                    case ComparisonOperatorType.NotEquals:
                    case ComparisonOperatorType.Equals:
                    case ComparisonOperatorType.LessOrEquals: {
                        maxCounts[i] = Math.max(maxCounts[i], goal.targetCount! + 1);
                        break;
                    }
                }
            }
        }
        
        if (this.lastStates.size === 0) {
            const initialState: State = new Int32Array(probabilities.length);
            this.lastStates.set(serializeState(initialState), 1);
        }
        
        runWorkerLoop(() => {
            this.updateFailureRate(groupedGoals);
            this.updateCompletionRate(groupedGoals);
            this.updateAverage();

            // TODO: Change 0.999999 to be a constant and make it closer to 1
            if (this.completionRate + this.failureRate >= 0.999999) {
                this.onCompletion?.();
                return false;
            }
            
            // TODO: Maybe move this to the top of the function, but don't
            // run it on first iteration
            this.nextStateCalculation(probabilities, maxCounts);
            
            return this.isRunning;
        });
    }
    
    pause() {
        this.isRunning = false;
    }
    
    getResult(maxDataPoints: number, minimumDistance?: number) {
        const dataPoints: CalculationDataPoint[] = getTruncatedDataDynamic(this.resultArray, maxDataPoints, minimumDistance)
            .map(x => ({
                completions: x.index,
                probability: x.value
            }));
        const result: DataCalculationResult = {
            type: CalculationResultType.DataResult,
            totalIterations: this.resultArray.length,
            average: this.average,
            completionRate: this.completionRate,
            failureRate: this.failureRate,
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
        if (this.completionRate === 0) {
            return 0;
        }
        
        const targetIterations = this.targetProbabilityAtIterations;
        if (targetIterations < 0) {
            return 0;
        }
        if (targetIterations >= this.resultArray.length) {
            return 1;
        }
        return this.resultArray.get(targetIterations) / this.completionRate;
    }
    
    getIterationsAtProbability() {
        if (this.completionRate === 0) {
            return undefined;
        }
        
        const targetProbability = this.targetIterationsAtProbability * this.completionRate;
        if (targetProbability < 0) {
            return undefined;
        }
        if (this.targetIterationsAtProbability > 1) {
            return undefined;
        }
        
        let low = 0;
        let high = this.resultArray.length - 1;
        while (low <= high) {
            const mid = Math.floor((low + high) / 2);
            if (this.resultArray.get(mid) >= targetProbability) {
                high = mid - 1;
            }
            else {
                low = mid + 1;
            }
        }
        return low;
    }
    
    destroy() {
        this.isRunning = false;
    }
}
