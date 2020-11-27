import { CalculationGoalNode, State } from "../../interfaces/CalculationInterfaces";

export class MultipleCalculationGoal implements CalculationGoalNode {
    private requiredSubGoals: number;
    private subGoals: CalculationGoalNode[];
    
    constructor(requiredSubGoals: number) {
        this.requiredSubGoals = requiredSubGoals;
        this.subGoals = [];
    }
    
    isCompleted(state: State) {
        let completed = 0;
        for (const goal of this.subGoals) {
            if (goal.isCompleted(state)) {
                completed++;
            }
        }
        return completed >= this.requiredSubGoals;
    }
    
    addSubGoal(goal: CalculationGoalNode) {
        this.subGoals.push(goal);
    }
}
