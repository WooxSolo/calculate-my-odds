import { uniqBy } from "lodash";
import { Calculation } from "../../shared/interfaces/calculator/Calculation";
import { CalculationDataPoint, CalculationResultType, DataCalculationResult } from "../../shared/interfaces/calculator/CalculationResult";
import { ComparisonOperatorType } from "../../shared/interfaces/Compators";
import { ProbabilityGoal } from "../../shared/interfaces/Goals";
import { ProbabilityItem } from "../../shared/interfaces/Probability";
import { getTruncatedArrayItems } from "../../simulator/helpers/ArrayHelpers";
import { runWorkerLoop } from "../../shared/helpers/LoopHelper";
import { checkGoalCompletion, groupGoals } from "../../simulator/helpers/SimulationHelpers";
import { DataCalculator } from "./Calculator";

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

export class CumulativeCompletionCalculator implements DataCalculator {
    private calculation: Calculation;
    private isRunning: boolean;
    private resultArray: number[];
    private lastStates: Map<string, number>;
    
    constructor(calculation: Calculation) {
        this.isRunning = false;
        this.calculation = calculation;
        this.resultArray = [];
        this.lastStates = new Map<string, number>();
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
        
        this.lastStates = new Map<string, number>();
        const initialState: State = new Int32Array(probabilities.length);
        this.lastStates.set(serializeState(initialState), 1);
        
        runWorkerLoop(() => {
            const completionProbability = this.calculateCompletionProbability(groupedGoals);
            this.resultArray.push(completionProbability);

            // TODO: Change 0.99 to be an input parameter
            if (completionProbability >= 0.99) {
                return false;
            }
            
            this.nextStateCalculation(probabilities, maxCounts);
            
            return this.isRunning;
        });
    }
    
    pause() {
        this.isRunning = false;
    }
    
    getResult() {
        const result: DataCalculationResult = {
            type: CalculationResultType.DataResult,
            dataPoints: this.resultArray.map((x, index) => ({
                completions: index,
                probability: x
            }))
        };
        return result;
    }
    
    getTruncatedResult(maxDataPoints: number, minimumDistance?: number) {
        let dataPoints: CalculationDataPoint[] = this.resultArray.map((x, index) => ({
            completions: index,
            probability: x
        }));
        if (minimumDistance !== undefined) {
            while (dataPoints.length > 0 && dataPoints[dataPoints.length - 1].probability >= 1 - minimumDistance) {
                dataPoints.pop();
            }
        }
        dataPoints = getTruncatedArrayItems(dataPoints, maxDataPoints);
        const result: DataCalculationResult = {
            type: CalculationResultType.DataResult,
            dataPoints: dataPoints
        };
        return result;
    }
    
    destroy() {
        this.isRunning = false;
    }
}
