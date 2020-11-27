import { faPlus } from "@fortawesome/free-solid-svg-icons";
import React from "react";
import { ComparisonOperatorType } from "../../../shared/interfaces/Compators";
import { AnyProbabilityGoal, FullCompletionGoal, PartialCompletionGoal, ProbabilityGoalType, SingularCompletionGoal } from "../../../shared/interfaces/Goals";
import { nextUniqueId } from "../../helper/IdHelpers";
import { ButtonWithDropdown } from "../common/ButtonWithDropdown";

interface Props {
    onNewGoal?: (goal: AnyProbabilityGoal) => void
}

interface State {
    
}

export class AddGoalButton extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);
        
        this.state = {
            
        };
    }
    
    private createSingleCompletionGoal() {
        const goal: SingularCompletionGoal = {
            type: ProbabilityGoalType.SingularCompletionGoal,
            id: nextUniqueId().toString(),
            comparator: {
                type: ComparisonOperatorType.GreaterOrEquals
            },
            targetCount: 1
        };
        return goal;
    }
    
    private createFullCompletionGoal() {
        const goal: FullCompletionGoal = {
            type: ProbabilityGoalType.FullCompletionGoal,
            id: nextUniqueId().toString(),
            goals: []
        };
        return goal;
    }
    
    private createPartialCompletionGoal() {
        const goal: PartialCompletionGoal = {
            type: ProbabilityGoalType.PartialCompletionGoal,
            id: nextUniqueId().toString(),
            goals: [],
            minimumCompletions: 1
        };
        return goal;
    }
    
    render() {
        return (
            <div className="add-goal-button-component">
                <ButtonWithDropdown
                    icon={faPlus}
                    content="Add goal"
                    onClick={() => this.props.onNewGoal?.(this.createSingleCompletionGoal())}
                    dropdownItems={[
                        {
                            name: "Single completion goal",
                            onClick: () => this.props.onNewGoal?.(this.createSingleCompletionGoal())
                        },
                        {
                            name: "Full completion goal",
                            onClick: () => this.props.onNewGoal?.(this.createFullCompletionGoal())
                        },
                        {
                            name: "Partial completion goal",
                            onClick: () => this.props.onNewGoal?.(this.createPartialCompletionGoal())
                        }
                    ]}
                    dropdownWidth="11em"
                />
            </div>
        );
    }
}