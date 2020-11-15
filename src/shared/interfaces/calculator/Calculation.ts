import { ProbabilityGoal } from "../Goals";
import { ProbabilityTable } from "../Probability";

export interface Calculation {
    tables: ProbabilityTable[],
    goals: ProbabilityGoal[]
}
