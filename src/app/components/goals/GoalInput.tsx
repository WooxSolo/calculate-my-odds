import React from "react";
import { AnyProbabilityGoal, ProbabilityGoalType } from "../../../shared/interfaces/Goals";
import { Validator } from "../../data-structures/Validator";
import { FullCompletionGoalInput } from "./FullCompletionGoalInput";
import { PartialCompletionGoalInput } from "./PartialCompletionGoalInput";
import { SingularCompletionGoalInput } from "./SingularCompletionGoalInput";

interface Props {
    itemNames: string[],
    goal: AnyProbabilityGoal,
    onChange: (goal: AnyProbabilityGoal) => void,
    onDeleteRequest?: () => void,
    validator: Validator
}

interface State {
    
}

export class GoalInput extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);
        
        this.state = {
            
        };
    }
    
    render() {
        switch (this.props.goal.type) {
            case ProbabilityGoalType.SingularCompletionGoal: return (
                <SingularCompletionGoalInput
                    goal={this.props.goal}
                    onChange={this.props.onChange}
                    itemNames={this.props.itemNames}
                    validator={this.props.validator}
                    onDeleteRequest={this.props.onDeleteRequest}
                />
            );
            case ProbabilityGoalType.FullCompletionGoal: return (
                <FullCompletionGoalInput
                    goal={this.props.goal}
                    onChange={this.props.onChange}
                    itemNames={this.props.itemNames}
                    validator={this.props.validator}
                    onDeleteRequest={this.props.onDeleteRequest}
                />
            );
            case ProbabilityGoalType.PartialCompletionGoal: return (
                <PartialCompletionGoalInput
                    goal={this.props.goal}
                    onChange={this.props.onChange}
                    itemNames={this.props.itemNames}
                    validator={this.props.validator}
                    onDeleteRequest={this.props.onDeleteRequest}
                />
            );
        }
        return null;
    }
}