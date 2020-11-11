import { groupBy } from "lodash";
import { ComparisonOperatorType } from "../../shared/interfaces/Compators";
import { ProbabilityGoal } from "../../shared/interfaces/Goals";
import { ProbabilityItem } from "../../shared/interfaces/Probability";
import { DynamicInt64Array } from "../../shared/data-structures/DynamicInt64Array";

export function calculateProbabilityArray(array: DynamicInt64Array, iterations: number) {
    const result = new Float64Array(array.length);
    let curr = BigInt(0);
    for (let i = 0; i < array.length; i++) {
        curr += array.get(i);
        result[i] = Number(curr) / iterations;
    }
    return result;
}

export function checkGoalCompletion(count: number, goal: ProbabilityGoal) {
    const target = goal.targetCount!;
    switch (goal.comparator!.type) {
        case ComparisonOperatorType.LessThan: return count < target;
        case ComparisonOperatorType.GreaterThan: return count > target;
        case ComparisonOperatorType.LessOrEquals: return count <= target;
        case ComparisonOperatorType.GreaterOrEquals: return count >= target;
        case ComparisonOperatorType.Equals: return count === target;
        case ComparisonOperatorType.NotEquals: return count !== target;
    }
    throw new Error(`Unhandled comparator operator: ${goal.comparator!.type}`);
}

export function groupGoals(probabilities: ProbabilityItem[], goals: ProbabilityGoal[]) {
    const groupedByProbability = groupBy(goals, x => x.item!.id);
    
    const result: ProbabilityGoal[][] = new Array(probabilities.length);
    for (let i = 0; i < probabilities.length; i++) {
        const item = probabilities[i];
        result[i] = groupedByProbability[item.id] ?? [];
    }
    return result;
}
