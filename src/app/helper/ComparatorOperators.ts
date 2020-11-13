import { ComparisonOperator, ComparisonOperatorType } from "../../shared/interfaces/Compators";

export const comparisonOperators: ComparisonOperator[] = [
    {
        type: ComparisonOperatorType.GreaterOrEquals
    },
    {
        type: ComparisonOperatorType.GreaterThan
    },
    {
        type: ComparisonOperatorType.LessOrEquals
    },
    {
        type: ComparisonOperatorType.LessThan
    },
    {
        type: ComparisonOperatorType.Equals
    },
    {
        type: ComparisonOperatorType.NotEquals
    }
];
