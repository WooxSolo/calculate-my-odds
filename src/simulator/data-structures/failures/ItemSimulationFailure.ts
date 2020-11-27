import { SimulationFailureNode } from "../../interfaces/SimulationInterfaces";
import { MultipleSimulationFailure } from "./MultipleSimulationFailure";

export class ItemSimulationFailure implements SimulationFailureNode {
    private checkFailure: (quantity: number) => boolean;
    public hasFailed: boolean;
    public parent?: MultipleSimulationFailure;
    
    constructor(checkFailure: (quantity: number) => boolean, parent?: MultipleSimulationFailure) {
        this.checkFailure = checkFailure;
        this.hasFailed = false;
        this.parent = parent;
    }
    
    onQuantityUpdated(quantity: number) {
        const newCompleted = this.checkFailure(quantity);
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
        this.hasFailed = this.checkFailure(0);
    }
}
