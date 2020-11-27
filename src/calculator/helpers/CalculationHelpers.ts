import { ComparisonOperator, ComparisonOperatorType } from "../../shared/interfaces/Compators";
import { AnyProbabilityFailure, FullCompletionFailure, ProbabilityFailureType } from "../../shared/interfaces/Failures";
import { AnyProbabilityGoal, ProbabilityGoalType } from "../../shared/interfaces/Goals";
import { ProbabilityTable } from "../../shared/interfaces/Probability";
import { ItemCalculationFailure } from "../data-structures/failures/ItemCalculationFailure";
import { MultipleCalculationFailure } from "../data-structures/failures/MultipleCalculationFailure";
import { ItemCalculationGoal } from "../data-structures/goals/ItemCalculationGoal";
import { MultipleCalculationGoal } from "../data-structures/goals/MultipleCalculationGoal";
import { CalculationGoalNode, CalculationTable, State } from "../interfaces/CalculationInterfaces";

export function parseState(stateString: string): State {
    return new Int32Array(stateString.split(",").map(x => parseInt(x)));
}

export function serializeState(state: State) {
    return state.join(",");
}

export function buildCalculationTables(tables: ProbabilityTable[], itemNameIndexMap: Map<string, number>) {
    const result: CalculationTable[] = [];
    for (const table of tables) {
        const calcTable: CalculationTable = {
            rollsPerIteration: table.rollsPerIteration!,
            items: []
        };
        for (const item of table.items) {
            calcTable.items.push({
                index: itemNameIndexMap.get(item.name)!,
                probability: item.probability!
            });
        }
        result.push(calcTable);
    }
    return result;
}

export function findCalculationItemIndicesForGoals(goal: AnyProbabilityGoal, result: Map<string, number>) {
    if (goal.type === ProbabilityGoalType.FullCompletionGoal || goal.type === ProbabilityGoalType.PartialCompletionGoal) {
        for (const childGoal of goal.goals) {
            findCalculationItemIndicesForGoals(childGoal, result);
        }
    }
    else if (goal.type === ProbabilityGoalType.SingularCompletionGoal) {
        if (goal.itemName !== undefined) {
            if (result.get(goal.itemName) === undefined) {
                result.set(goal.itemName, result.size);
            }
        }
    }
    else {
        throw new Error();
    }
}

export function findCalculationItemIndicesForFailures(failure: AnyProbabilityFailure, result: Map<string, number>) {
    if (failure.type === ProbabilityFailureType.FullCompletionFailure || failure.type === ProbabilityFailureType.PartialCompletionFailure) {
        for (const childFailure of failure.failures) {
            findCalculationItemIndicesForFailures(childFailure, result);
        }
    }
    else if (failure.type === ProbabilityFailureType.SingularCompletionFailure) {
        if (failure.itemName !== undefined) {
            if (result.get(failure.itemName) === undefined) {
                result.set(failure.itemName, result.size);
            }
        }
    }
    else {
        throw new Error();
    }
}

export function buildCalculationGoals(goal: AnyProbabilityGoal,
        itemNameToIndexMap: Map<string, number>,
        parent?: MultipleCalculationGoal) {
    if (goal.type === ProbabilityGoalType.SingularCompletionGoal) {
        const calcGoal = new ItemCalculationGoal(itemNameToIndexMap.get(goal.itemName!)!, goal.targetCount!, goal.comparator);
        if (parent) {
            parent.addSubGoal(calcGoal);
        }
        return calcGoal;
    }
    else if (goal.type === ProbabilityGoalType.FullCompletionGoal) {
        const calcGoal = new MultipleCalculationGoal(goal.goals.length);
        if (parent) {
            parent.addSubGoal(calcGoal);
        }
        for (const subGoal of goal.goals) {
            buildCalculationGoals(subGoal, itemNameToIndexMap, calcGoal);
        }
        return calcGoal;
    }
    else if (goal.type === ProbabilityGoalType.PartialCompletionGoal) {
        const calcGoal = new MultipleCalculationGoal(goal.minimumCompletions);
        if (parent) {
            parent.addSubGoal(calcGoal);
        }
        for (const subGoal of goal.goals) {
            buildCalculationGoals(subGoal, itemNameToIndexMap, calcGoal);
        }
        return calcGoal;
    }
    throw new Error();
}

function buildCalculationFailureRecursive(failure: AnyProbabilityFailure,
        itemNameToIndexMap: Map<string, number>,
        parent?: MultipleCalculationFailure) {
    if (failure.type === ProbabilityFailureType.SingularCompletionFailure) {
        const calcFailure = new ItemCalculationFailure(itemNameToIndexMap.get(failure.itemName!)!,
            failure.targetCount!, failure.comparator);
        if (parent) {
            parent.addSubFailure(calcFailure);
        }
        return calcFailure;
    }
    else if (failure.type === ProbabilityFailureType.FullCompletionFailure) {
        const calcFailure = new MultipleCalculationFailure(failure.failures.length);
        if (parent) {
            parent.addSubFailure(calcFailure);
        }
        for (const subFailure of failure.failures) {
            buildCalculationFailureRecursive(subFailure, itemNameToIndexMap, calcFailure);
        }
        return calcFailure;
    }
    else if (failure.type === ProbabilityFailureType.PartialCompletionFailure) {
        const calcFailure = new MultipleCalculationFailure(failure.minimumCompletions);
        if (parent) {
            parent.addSubFailure(calcFailure);
        }
        for (const subFailure of failure.failures) {
            buildCalculationFailureRecursive(subFailure, itemNameToIndexMap, calcFailure);
        }
        return calcFailure;
    }
    throw new Error();
}

export function buildCalculationFailure(failure: FullCompletionFailure, itemNameToIndexMap: Map<string, number>) {
    if (failure.failures.length === 0) {
        // No failures means it will not be possible to fail
        return new MultipleCalculationFailure(1);
    }
    return buildCalculationFailureRecursive(failure, itemNameToIndexMap);
}

function getMaxCount(comparator: ComparisonOperator, targetCount: number) {
    switch (comparator.type) {
        case ComparisonOperatorType.GreaterOrEquals:
        case ComparisonOperatorType.LessThan: {
            return targetCount;
        }
        case ComparisonOperatorType.GreaterThan:
        case ComparisonOperatorType.NotEquals:
        case ComparisonOperatorType.Equals:
        case ComparisonOperatorType.LessOrEquals: {
            return targetCount + 1;
        }
    }
    throw new Error();
}

export function buildCalculationGoalsMaxCountsFromGoals(goal: AnyProbabilityGoal,
        itemNameToIndexMap: Map<string, number>, result: Int32Array) {
    if (goal.type === ProbabilityGoalType.FullCompletionGoal || goal.type === ProbabilityGoalType.PartialCompletionGoal) {
        for (const subGoal of goal.goals) {
            buildCalculationGoalsMaxCountsFromGoals(subGoal, itemNameToIndexMap, result);
        }
    }
    else if (goal.type === ProbabilityGoalType.SingularCompletionGoal) {
        const index = itemNameToIndexMap.get(goal.itemName!)!;
        result[index] = Math.max(result[index], getMaxCount(goal.comparator, goal.targetCount!));
    }
    else {
        throw new Error();
    }
}

export function buildCalculationGoalsMaxCountsFromFailures(failure: AnyProbabilityFailure,
        itemNameToIndexMap: Map<string, number>, result: Int32Array) {
    if (failure.type === ProbabilityFailureType.FullCompletionFailure || failure.type === ProbabilityFailureType.PartialCompletionFailure) {
        for (const subFailure of failure.failures) {
            buildCalculationGoalsMaxCountsFromFailures(subFailure, itemNameToIndexMap, result);
        }
    }
    else if (failure.type === ProbabilityFailureType.SingularCompletionFailure) {
        const index = itemNameToIndexMap.get(failure.itemName!)!;
        result[index] = Math.max(result[index], getMaxCount(failure.comparator, failure.targetCount!));
    }
    else {
        throw new Error();
    }
}
