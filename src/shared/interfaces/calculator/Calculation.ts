import { FullCompletionFailure } from "../Failures";
import { FullCompletionGoal } from "../Goals";
import { ProbabilityTable } from "../Probability";

export interface Calculation {
    tables: ProbabilityTable[],
    rootGoal: FullCompletionGoal,
    rootFailure: FullCompletionFailure
}
