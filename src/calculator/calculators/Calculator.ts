import { flatten, groupBy, uniqBy } from "lodash";
import { Calculation } from "../../shared/interfaces/calculator/Calculation";
import { CalculationDataPoint, CalculationResultType, DataCalculationResult } from "../../shared/interfaces/calculator/CalculationResult";
import { ComparisonOperatorType } from "../../shared/interfaces/Compators";
import { ProbabilityGoal } from "../../shared/interfaces/Goals";
import { ProbabilityItem, ProbabilityTable } from "../../shared/interfaces/Probability";
import { runWorkerLoop } from "../../shared/helpers/LoopHelper";
import { checkGoalCompletion, checkGoalFailure, groupGoals } from "../../simulator/helpers/SimulationHelpers";
import { DynamicFloat64Array } from "../../shared/data-structures/DynamicFloat64Array";
import { getTruncatedDataDynamic } from "../../shared/helpers/CalculationHelper";
import { debug } from "webpack";

type State = Int32Array

interface CalculationData {
    
}

function parseState(stateString: string): State {
    return new Int32Array(stateString.split(",").map(x => parseInt(x)));
}

function serializeState(state: State) {
    return state.join(",");
}

function checkCompletion(state: State, groupedGoals: ItemGoalGroup[]) {
    for (let i = 0; i < state.length; i++) {
        for (const goal of flatten(groupedGoals.map(x => x.goals))) {
            if (!checkGoalCompletion(state[i], goal)) {
                return false;
            }
        }
    }
    return true;
}

function checkFailure(state: State, groupedGoals: ItemGoalGroup[]) {
    for (let i = 0; i < state.length; i++) {
        for (const goal of flatten(groupedGoals.map(x => x.goals))) {
            if (checkGoalFailure(state[i], goal)) {
                return true;
            }
        }
    }
    return false;
}

interface ItemGoalGroup {
    item: ProbabilityItem,
    goals: ProbabilityGoal[]
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
    
    private nextStateCalculation(tables: ProbabilityTable[], maxCounts: Int32Array,
            itemToIndexMap: Map<string, number>) {
        let states = this.lastStates;
        
        // TODO: Consider storing the index on an object with the item for performance
        // instead of using the itemToIndexMap
        
        for (const table of tables) {
            for (let rollNumber = 0; rollNumber < table.rollsPerIteration!; rollNumber++) {
                const nextStates = new Map<string, number>();
                const nothingProbability = 1 - table.items.reduce((a, item) => {
                    const index = itemToIndexMap.get(item.id);
                    if (index === undefined) {
                        return a;
                    }
                    return a + item.probability!;
                }, 0);
                    
                for (const stateEntry of states) {
                    for (const item of table.items) {
                        const index = itemToIndexMap.get(item.id);
                        if (index === undefined) {
                            // TODO: Consider filtering the items in the table before iterating it
                            // to not have to iterate over items that don't impact
                            // the goal in any way
                            continue;
                        }
                        
                        const state = parseState(stateEntry[0]);
                        const nextState = new Int32Array(state);
                        nextState[index] = Math.min(maxCounts[index], nextState[index] + 1);
                        const serializedState = serializeState(nextState);
                        
                        const prevProbability = nextStates.get(serializedState) ?? 0;
                        const nextProbability = stateEntry[1] * item.probability!;
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
    
    private updateCompletionRate(groupedGoals: ItemGoalGroup[]) {
        for (const stateEntry of this.lastStates) {
            if (checkCompletion(parseState(stateEntry[0]), groupedGoals)) {
                this.completionRate += stateEntry[1];
                this.lastStates.delete(stateEntry[0]);
            }
        }
        this.resultArray.push(this.completionRate);
    }
    
    private updateFailureRate(groupedGoals: ItemGoalGroup[]) {
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
        
        const tables = this.calculation.tables;
        const goals = this.calculation.goals;
        const uniqueGoalItemDictionary = groupBy(goals, x => x.item!.id);
        const uniqueGroupedGoals = Object.keys(uniqueGoalItemDictionary).map(key => ({
            item: uniqueGoalItemDictionary[key][0].item,
            goals: uniqueGoalItemDictionary[key]
        } as ItemGoalGroup));
        const maxCounts = new Int32Array(uniqueGroupedGoals.length);
        for (let i = 0; i < uniqueGroupedGoals.length; i++) {
            const group = uniqueGroupedGoals[i];
            const maxNeed = Math.max(...group.goals.map(goal => {
                switch (goal.comparator.type) {
                    case ComparisonOperatorType.GreaterOrEquals:
                    case ComparisonOperatorType.LessThan: {
                        return goal.targetCount!;
                    }
                    case ComparisonOperatorType.GreaterThan:
                    case ComparisonOperatorType.NotEquals:
                    case ComparisonOperatorType.Equals:
                    case ComparisonOperatorType.LessOrEquals: {
                        return Math.max(maxCounts[i], goal.targetCount! + 1);
                    }
                }
                throw new Error("Unhandled comparion operator");
            }));
            maxCounts[i] = maxNeed;
        }
        const itemToIndexMap = new Map<string, number>(uniqueGroupedGoals.map((x, index) => [
            x.item.id,
            index
        ]));
        
        if (this.lastStates.size === 0) {
            const initialState: State = new Int32Array(uniqueGroupedGoals.length);
            this.lastStates.set(serializeState(initialState), 1);
        }
        
        runWorkerLoop(() => {
            this.updateFailureRate(uniqueGroupedGoals);
            this.updateCompletionRate(uniqueGroupedGoals);
            this.updateAverage();

            // TODO: Change 0.999999 to be a constant and make it closer to 1
            if (this.completionRate + this.failureRate >= 0.999999) {
                this.onCompletion?.();
                return false;
            }
            
            // TODO: Maybe move this to the top of the function, but don't
            // run it on first iteration
            this.nextStateCalculation(tables, maxCounts, itemToIndexMap);
            
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
