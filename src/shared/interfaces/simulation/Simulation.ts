import { ProbabilityGoal } from "../Goals";
import { ProbabilityTable } from "../Probability";

export interface Simulation {
    tables: ProbabilityTable[],
    goals: ProbabilityGoal[]
}
