import { AnyProbabilityGoal, ProbabilityGoalType } from "../../shared/interfaces/Goals";
import { ProbabilityTable } from "../../shared/interfaces/Probability";
import { SimulationFailureNode, SimulationGoalNode, SimulationItemEffect, SimulationTable } from "../interfaces/SimulationInterfaces";
import { ItemSimulationGoal } from "../data-structures/goals/ItemSimulationGoal";
import { MultipleSimulationGoal } from "../data-structures/goals/MultipleSimulationGoal";
import { AnyProbabilityFailure, FullCompletionFailure, ProbabilityFailureType } from "../../shared/interfaces/Failures";
import { MultipleSimulationFailure } from "../data-structures/failures/MultipleSimulationFailure";
import { ItemSimulationFailure } from "../data-structures/failures/ItemSimulationFailure";
import { checkCompletion } from "../../shared/helpers/ObjectiveHelpers";

export function buildSimulationGoals(goal: AnyProbabilityGoal,
        goalToSimulationMap: Map<AnyProbabilityGoal, SimulationGoalNode>,
        parent?: MultipleSimulationGoal) {
    if (goal.type === ProbabilityGoalType.SingularCompletionGoal) {
        const targetCount = goal.targetCount!;
        const comparator = goal.comparator;
        const simGoal = new ItemSimulationGoal(quantity => checkCompletion(quantity, targetCount, comparator), parent);
        if (parent) {
            parent.addSubGoal(simGoal);
        }
        goalToSimulationMap.set(goal, simGoal);
        return simGoal;
    }
    else if (goal.type === ProbabilityGoalType.FullCompletionGoal) {
        const simGoal = new MultipleSimulationGoal(goal.goals.length, parent);
        if (parent) {
            parent.addSubGoal(simGoal);
        }
        for (const subGoal of goal.goals) {
            buildSimulationGoals(subGoal, goalToSimulationMap, simGoal);
        }
        goalToSimulationMap.set(goal, simGoal);
        return simGoal;
    }
    else if (goal.type === ProbabilityGoalType.PartialCompletionGoal) {
        const simGoal = new MultipleSimulationGoal(goal.minimumCompletions, parent);
        if (parent) {
            parent.addSubGoal(simGoal);
        }
        for (const subGoal of goal.goals) {
            buildSimulationGoals(subGoal, goalToSimulationMap, simGoal);
        }
        goalToSimulationMap.set(goal, simGoal);
        return simGoal;
    }
    throw new Error();
}

function buildSimulationFailureRecursive(failure: AnyProbabilityFailure,
        failureToSimulationMap: Map<AnyProbabilityFailure, SimulationFailureNode>,
        parent?: MultipleSimulationFailure) {
    if (failure.type === ProbabilityFailureType.SingularCompletionFailure) {
        const targetCount = failure.targetCount!;
        const comparator = failure.comparator;
        const simFailure = new ItemSimulationFailure(quantity => checkCompletion(quantity, targetCount, comparator), parent);
        if (parent) {
            parent.addSubFailure(simFailure);
        }
        failureToSimulationMap.set(failure, simFailure);
        return simFailure;
    }
    else if (failure.type === ProbabilityFailureType.FullCompletionFailure) {
        const simFailure = new MultipleSimulationFailure(failure.failures.length, parent);
        if (parent) {
            parent.addSubFailure(simFailure);
        }
        for (const subFailure of failure.failures) {
            buildSimulationFailureRecursive(subFailure, failureToSimulationMap, simFailure);
        }
        failureToSimulationMap.set(failure, simFailure);
        return simFailure;
    }
    else if (failure.type === ProbabilityFailureType.PartialCompletionFailure) {
        const simFailure = new MultipleSimulationFailure(failure.minimumCompletions, parent);
        if (parent) {
            parent.addSubFailure(simFailure);
        }
        for (const subFailure of failure.failures) {
            buildSimulationFailureRecursive(subFailure, failureToSimulationMap, simFailure);
        }
        failureToSimulationMap.set(failure, simFailure);
        return simFailure;
    }
    throw new Error();
}

export function buildSimulationFailure(failure: FullCompletionFailure,
        failureToSimulationMap: Map<AnyProbabilityFailure, SimulationFailureNode>) {
    if (failure.failures.length === 0) {
        // No failures means it will not be possible to fail
        return new MultipleSimulationFailure(1);
    }
    return buildSimulationFailureRecursive(failure, failureToSimulationMap);
}

export function findSimulationGoalItemEffects(goal: AnyProbabilityGoal,
        goalToSimulationMap: Map<AnyProbabilityGoal, SimulationGoalNode>,
        result: Map<string, SimulationItemEffect>) {
    if (goal.type === ProbabilityGoalType.FullCompletionGoal || goal.type === ProbabilityGoalType.PartialCompletionGoal) {
        for (const childGoal of goal.goals) {
            findSimulationGoalItemEffects(childGoal, goalToSimulationMap, result);
        }
    }
    else if (goal.type === ProbabilityGoalType.SingularCompletionGoal) {
        if (goal.itemName !== undefined) {
            let simItemEffect = result.get(goal.itemName);
            if (!simItemEffect) {
                simItemEffect = {
                    index: result.size,
                    impactedGoals: [],
                    impactedFailures: []
                };
                result.set(goal.itemName, simItemEffect);
            }
            simItemEffect.impactedGoals.push(goalToSimulationMap.get(goal) as ItemSimulationGoal);
        }
    }
    else {
        throw new Error();
    }
}

export function findSimulationFailureItemEffects(failure: AnyProbabilityFailure,
        failureToSimulationMap: Map<AnyProbabilityFailure, SimulationFailureNode>,
        result: Map<string, SimulationItemEffect>) {
    if (failure.type === ProbabilityFailureType.FullCompletionFailure || failure.type === ProbabilityFailureType.PartialCompletionFailure) {
        for (const childFailure of failure.failures) {
            findSimulationFailureItemEffects(childFailure, failureToSimulationMap, result);
        }
    }
    else if (failure.type === ProbabilityFailureType.SingularCompletionFailure) {
        if (failure.itemName !== undefined) {
            let simItemEffect = result.get(failure.itemName);
            if (!simItemEffect) {
                simItemEffect = {
                    index: result.size,
                    impactedGoals: [],
                    impactedFailures: []
                };
                result.set(failure.itemName, simItemEffect);
            }
            simItemEffect.impactedFailures.push(failureToSimulationMap.get(failure) as ItemSimulationFailure);
        }
    }
    else {
        throw new Error();
    }
}

export function buildSimulationTables(tables: ProbabilityTable[], itemEffects: Map<string, SimulationItemEffect>) {
    const result: SimulationTable[] = [];
    for (const table of tables) {
        const simTable: SimulationTable = {
            rollsPerIteration: table.rollsPerIteration!,
            items: []
        };
        for (const item of table.items) {
            const simItemEffect = itemEffects.get(item.name);
            if (!simItemEffect) {
                continue;
            }
            simTable.items.push({
                ...simItemEffect,
                probability: item.probability!
            });
        }
        result.push(simTable);
    }
    return result;
}
