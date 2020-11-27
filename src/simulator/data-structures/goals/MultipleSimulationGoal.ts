import { SimulationGoalNode } from "../../interfaces/SimulationInterfaces";

export class MultipleSimulationGoal implements SimulationGoalNode {
    private completedSubGoals: number;
    private requiredSubGoals: number;
    private subGoals: SimulationGoalNode[];
    public isCompleted: boolean;
    public parent?: MultipleSimulationGoal;
    
    constructor(requiredSubGoals: number, parent?: MultipleSimulationGoal) {
        this.completedSubGoals = 0;
        this.requiredSubGoals = requiredSubGoals;
        this.subGoals = [];
        this.isCompleted = false;
        this.parent = parent;
    }
    
    updateCompletedSubGoals(diff: number) {
        this.completedSubGoals += diff;
        const newCompleted = this.completedSubGoals >= this.requiredSubGoals;
        if (this.parent) {
            if (this.isCompleted && !newCompleted) {
                this.parent.updateCompletedSubGoals(-1);
            }
            else if (!this.isCompleted && newCompleted) {
                this.parent.updateCompletedSubGoals(1);
            }
        }
        this.isCompleted = newCompleted;
    }
    
    reset() {
        this.completedSubGoals = 0;
        this.isCompleted = this.completedSubGoals >= this.requiredSubGoals;
        if (this.parent && this.isCompleted) {
            this.parent.updateCompletedSubGoals(1);
        }
        for (const goal of this.subGoals) {
            goal.reset();
        }
    }
    
    addSubGoal(goal: SimulationGoalNode) {
        this.subGoals.push(goal);
    }
}
