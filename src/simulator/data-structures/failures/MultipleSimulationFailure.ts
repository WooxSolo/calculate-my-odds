import { SimulationFailureNode } from "../../interfaces/SimulationInterfaces";

export class MultipleSimulationFailure implements SimulationFailureNode {
    private completedSubFailures: number;
    private requiredSubFailures: number;
    private subFailures: SimulationFailureNode[];
    public hasFailed: boolean;
    public parent?: MultipleSimulationFailure;
    
    constructor(requiredSubFailures: number, parent?: MultipleSimulationFailure) {
        this.completedSubFailures = 0;
        this.requiredSubFailures = requiredSubFailures;
        this.subFailures = [];
        this.hasFailed = false;
        this.parent = parent;
    }
    
    updateCompletedSubFailures(diff: number) {
        this.completedSubFailures += diff;
        const newCompleted = this.completedSubFailures >= this.requiredSubFailures;
        if (this.parent) {
            if (this.hasFailed && !newCompleted) {
                this.parent.updateCompletedSubFailures(-1);
            }
            else if (!this.hasFailed && newCompleted) {
                this.parent.updateCompletedSubFailures(1);
            }
        }
        this.hasFailed = newCompleted;
    }
    
    reset() {
        this.completedSubFailures = 0;
        this.hasFailed = this.completedSubFailures >= this.requiredSubFailures;
        if (this.parent && this.hasFailed) {
            this.parent.updateCompletedSubFailures(1);
        }
        for (const failure of this.subFailures) {
            failure.reset();
        }
    }
    
    addSubFailure(failure: SimulationFailureNode) {
        this.subFailures.push(failure);
    }
}
