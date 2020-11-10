
/**
 * >
 * <
 * ==
 * >=
 * <=
 * !=
 */

export enum ComparisonOperatorType {
    GreaterThan = ">",
    LessThan = "<",
    Equals = "=",
    GreaterOrEquals = ">=",
    LessOrEquals = "<=",
    NotEquals = "!="
}
 
export interface ComparisonOperator {
    type: ComparisonOperatorType
}
