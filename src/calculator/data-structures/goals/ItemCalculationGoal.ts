import { checkCompletion } from "../../../shared/helpers/ObjectiveHelpers";
import { ComparisonOperator } from "../../../shared/interfaces/Compators";
import { CalculationGoalNode, State } from "../../interfaces/CalculationInterfaces";

export class ItemCalculationGoal implements CalculationGoalNode {
    private itemIndex: number;
    private target: number;
    private comparisonOperator: ComparisonOperator;
    
    constructor(itemIndex: number, target: number, comparisonOperator: ComparisonOperator) {
        this.itemIndex = itemIndex;
        this.target = target;
        this.comparisonOperator = comparisonOperator;
    }
    
    isCompleted(state: State) {
        return checkCompletion(state[this.itemIndex], this.target, this.comparisonOperator);
    }
}
