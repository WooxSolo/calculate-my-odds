import { ComparisonOperator, ComparisonOperatorType } from "../../shared/interfaces/Compators";

export const comparisonOperators: ComparisonOperator[] = [
    {
        type: ComparisonOperatorType.LessThan
    },
    {
        type: ComparisonOperatorType.GreaterThan
    },
    {
        type: ComparisonOperatorType.LessOrEquals
    },
    {
        type: ComparisonOperatorType.GreaterOrEquals
    },
    {
        type: ComparisonOperatorType.Equals
    },
    {
        type: ComparisonOperatorType.NotEquals
    }
];
