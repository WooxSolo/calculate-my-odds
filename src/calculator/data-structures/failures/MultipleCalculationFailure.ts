import { CalculationFailureNode, State } from "../../interfaces/CalculationInterfaces";

export class MultipleCalculationFailure implements CalculationFailureNode {
    private requiredSubFailures: number;
    private subFailures: CalculationFailureNode[];
    
    constructor(requiredSubFailures: number) {
        this.requiredSubFailures = requiredSubFailures;
        this.subFailures = [];
    }
    
    hasFailed(state: State) {
        let completed = 0;
        for (const failure of this.subFailures) {
            if (failure.hasFailed(state)) {
                completed++;
            }
        }
        return completed >= this.requiredSubFailures;
    }
    
    addSubFailure(failure: CalculationFailureNode) {
        this.subFailures.push(failure);
    }
}
