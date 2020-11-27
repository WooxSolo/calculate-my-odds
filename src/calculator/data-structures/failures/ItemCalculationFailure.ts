import { checkCompletion } from "../../../shared/helpers/ObjectiveHelpers";
import { ComparisonOperator } from "../../../shared/interfaces/Compators";
import { CalculationFailureNode, State } from "../../interfaces/CalculationInterfaces";

export class ItemCalculationFailure implements CalculationFailureNode {
    private itemIndex: number;
    private target: number;
    private comparisonOperator: ComparisonOperator;
    
    constructor(itemIndex: number, target: number, comparisonOperator: ComparisonOperator) {
        this.itemIndex = itemIndex;
        this.target = target;
        this.comparisonOperator = comparisonOperator;
    }
    
    hasFailed(state: State) {
        return checkCompletion(state[this.itemIndex], this.target, this.comparisonOperator);
    }
}
