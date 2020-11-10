import { groupBy } from "lodash";
import { ComparisonOperatorType } from "../../shared/interfaces/Compators";
import { ProbabilityGoal } from "../../shared/interfaces/Goals";
import { ProbabilityItem } from "../../shared/interfaces/Probability";

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
