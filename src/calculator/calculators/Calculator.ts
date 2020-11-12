import { uniqBy } from "lodash";
import { Calculation } from "../../shared/interfaces/calculator/Calculation";
import { CalculationDataPoint, CalculationResultType, DataCalculationResult } from "../../shared/interfaces/calculator/CalculationResult";
import { ComparisonOperatorType } from "../../shared/interfaces/Compators";
import { ProbabilityGoal } from "../../shared/interfaces/Goals";
import { ProbabilityItem } from "../../shared/interfaces/Probability";
import { runWorkerLoop } from "../../shared/helpers/LoopHelper";
import { checkGoalCompletion, groupGoals } from "../../simulator/helpers/SimulationHelpers";
import { DynamicFloat64Array } from "../../shared/data-structures/DynamicFloat64Array";
import { getTruncatedDataDynamic } from "../../shared/helpers/CalculationHelper";

type State = Int32Array

function parseState(stateString: string): State {
    return new Int32Array(stateString.split(",").map(x => parseInt(x)));
}

function serializeState(state: State) {
    return state.join(",");
}

function checkComplation(state: State, groupedGoals: ProbabilityGoal[][]) {
    for (let i = 0; i < state.length; i++) {
        for (const goal of groupedGoals[i]) {
            if (!checkGoalCompletion(state[i], goal)) {
                return false;
            }
        }
    }
    return true;
}

export class Calculator {
    private calculation: Calculation;
    private isRunning: boolean;
    private resultArray: DynamicFloat64Array;
    private lastStates: Map<string, number>;
    private maximumErrorRange: number;
    private average: number;
    private onCompletion?: () => void;
    
    constructor(calculation: Calculation, onCompletion?: () => void) {
        this.isRunning = false;
        this.calculation = calculation;
        this.resultArray = new DynamicFloat64Array();
        this.lastStates = new Map<string, number>();
        this.maximumErrorRange = 1;
        this.average = 0;
        this.onCompletion = onCompletion;
    }
    
    private calculateCompletionProbability(groupedGoals: ProbabilityGoal[][]) {
        const states = this.lastStates;
        
        let completionProbability = 0;
        for (const stateEntry of states) {
            if (checkComplation(parseState(stateEntry[0]), groupedGoals)) {
                completionProbability += stateEntry[1];
            }
        }
        
        return completionProbability;
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
                nextStates.set(serializedState, prevProbability + nextProbability);
            }
            
            const nothingProbability = 1 - probabilities.reduce((a, b) => a + b.probability!, 0);
            const prevNothingProbability = nextStates.get(stateEntry[0]) ?? 0;
            const nextNothingProbability = stateEntry[1] * nothingProbability;
            nextStates.set(stateEntry[0], prevNothingProbability + nextNothingProbability);
        }
        
        this.lastStates = nextStates;
    }
    
    private updateAverage() {
        if (this.resultArray.length < 2) {
            return;
        }
        
        const probability = this.resultArray.get(this.resultArray.length - 1) - this.resultArray.get(this.resultArray.length - 2);
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
                    case ComparisonOperatorType.GreaterOrEquals: {
                        maxCounts[i] = Math.max(maxCounts[i], goal.targetCount!);
                        break;
                    }
                    case ComparisonOperatorType.GreaterThan: {
                        maxCounts[i] = Math.max(maxCounts[i], goal.targetCount! + 1);
                        break;
                    }
                    case ComparisonOperatorType.Equals:
                    case ComparisonOperatorType.NotEquals:
                    case ComparisonOperatorType.LessThan:
                    case ComparisonOperatorType.LessOrEquals: {
                        // TODO: Implement these
                        throw new Error();
                    }
                }
            }
        }
        
        if (this.lastStates.size === 0) {
            const initialState: State = new Int32Array(probabilities.length);
            this.lastStates.set(serializeState(initialState), 1);
        }
        
        runWorkerLoop(() => {
            const completionProbability = this.calculateCompletionProbability(groupedGoals);
            this.resultArray.push(completionProbability);
            this.maximumErrorRange = 1 - completionProbability;
            this.updateAverage();

            // TODO: Change 0.999999 to be a constant and make it closer to 1
            if (completionProbability >= 0.999999) {
                this.onCompletion?.();
                return false;
            }
            
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
            maximumErrorRange: this.maximumErrorRange,
            average: this.average + this.maximumErrorRange * this.resultArray.length,
            dataPoints: dataPoints
        };
        return result;
    }
    
    destroy() {
        this.isRunning = false;
    }
}
