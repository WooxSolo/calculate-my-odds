import { groupBy } from "lodash";
import { ProbabilityGoal } from "../../shared/interfaces/Goals";
import { ProbabilityItem } from "../../shared/interfaces/Probability";

export function checkGoalCompletion(count: number, goal: ProbabilityGoal) {
    const target = goal.targetCount!;
    switch (goal.comparator!.name) {
        case "<": return count < target;
        case ">": return count > target;
        case "<=": return count <= target;
        case ">=": return count >= target;
        case "=": return count === target;
        case "!=": return count !== target;
    }
    throw new Error(`Unhandled comparator operator: ${goal.comparator!.name}`);
}

export function groupGoals(probabilities: ProbabilityItem[], goals: ProbabilityGoal[]) {
    const groupedByProbability = groupBy(goals, x => x.item!.id);
    
    const result = new Array(probabilities.length);
    for (let i = 0; i < probabilities.length; i++) {
        const item = probabilities[i];
        result[i] = groupedByProbability[item.id] ?? [];
    }
    return result;
}
