import { SimulationGoalNode } from "../../interfaces/SimulationInterfaces";
import { MultipleSimulationGoal } from "./MultipleSimulationGoal";

export class ItemSimulationGoal implements SimulationGoalNode {
    private checkCompletion: (quantity: number) => boolean;
    public isCompleted: boolean;
    public parent?: MultipleSimulationGoal;
    
    constructor(checkCompletion: (quantity: number) => boolean, parent?: MultipleSimulationGoal) {
        this.checkCompletion = checkCompletion;
        this.isCompleted = false;
        this.parent = parent;
    }
    
    onQuantityUpdated(quantity: number) {
        const newCompleted = this.checkCompletion(quantity);
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
        this.isCompleted = this.checkCompletion(0);
    }
}
