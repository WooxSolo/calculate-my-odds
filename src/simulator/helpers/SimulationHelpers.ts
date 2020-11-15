import { groupBy } from "lodash";
import { ComparisonOperatorType } from "../../shared/interfaces/Compators";
import { ProbabilityGoal } from "../../shared/interfaces/Goals";
import { ProbabilityItem, ProbabilityTable } from "../../shared/interfaces/Probability";
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

export function checkGoalFailure(count: number, goal: ProbabilityGoal) {
    const target = goal.targetCount!;
    switch (goal.comparator!.type) {
        case ComparisonOperatorType.LessThan: return count >= target;
        case ComparisonOperatorType.LessOrEquals: return count > target;
        case ComparisonOperatorType.Equals: return count > target;
    }
    return false;
}

export function groupGoals(tables: ProbabilityTable[], goals: ProbabilityGoal[]) {
    const groupedByProbability = groupBy(goals, x => x.item!.id);
    
    const result: ProbabilityGoal[][][] = new Array(tables.length);
    for (let tableIndex = 0; tableIndex < tables.length; tableIndex++) {
        const table = tables[tableIndex];
        const currResult: ProbabilityGoal[][] = new Array(table.items.length);
        for (let i = 0; i < table.items.length; i++) {
            const item = table.items[i];
            currResult[i] = groupedByProbability[item.id] ?? [];
        }
        result[tableIndex] = currResult;
    }
    return result;
}
