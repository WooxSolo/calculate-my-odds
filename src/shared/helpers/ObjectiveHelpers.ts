import { ComparisonOperator, ComparisonOperatorType } from "../interfaces/Compators";

export function checkCompletion(count: number, target: number, comparator: ComparisonOperator) {
    switch (comparator.type) {
        case ComparisonOperatorType.LessThan: return count < target;
        case ComparisonOperatorType.GreaterThan: return count > target;
        case ComparisonOperatorType.LessOrEquals: return count <= target;
        case ComparisonOperatorType.GreaterOrEquals: return count >= target;
        case ComparisonOperatorType.Equals: return count === target;
        case ComparisonOperatorType.NotEquals: return count !== target;
    }
    throw new Error(`Unhandled comparator operator: ${comparator.type}`);
}
