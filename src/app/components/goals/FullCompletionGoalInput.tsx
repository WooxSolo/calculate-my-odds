import "./FullCompletionGoalInput.scss";
import React from "react";
import { AnyProbabilityGoal, FullCompletionGoal } from "../../../shared/interfaces/Goals";
import { Panel } from "../common/Panel";
import { Validator } from "../../data-structures/Validator";
import { ButtonContainer } from "../common/ButtonContainer";
import { AddGoalButton } from "./AddGoalButton";
import { GoalInput } from "./GoalInput";
import { SpaceContainer } from "../common/SpaceContainer";
import { ErrorDisplay } from "../common/ErrorDisplay";

interface Props {
    itemNames: string[],
    goal: FullCompletionGoal,
    onChange: (goal: FullCompletionGoal) => void,
    onDeleteRequest?: () => void,
    validator: Validator
}

interface State {
    showNoSubgoalsError: boolean
}

export class FullCompletionGoalInput extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);
        
        this.state = {
            showNoSubgoalsError: false
        };
        
        this.validate = this.validate.bind(this);
    }
    
    componentDidMount() {
        this.props.validator.addValidation(this.validate);
    }
    
    componentWillUnmount() {
        this.props.validator.removeValidation(this.validate);
    }
    
    private validate() {
        if (this.props.goal.goals.length === 0) {
            this.setState({
                showNoSubgoalsError: true
            });
            return false;
        }
        return true;
    }
    
    private addGoal(goal: AnyProbabilityGoal) {
        this.props.onChange({
            ...this.props.goal,
            goals: [...this.props.goal.goals, goal]
        });
        this.setState({
            showNoSubgoalsError: false
        });
    }
    
    private updateGoal(index: number, goal: AnyProbabilityGoal) {
        const newGoals = [...this.props.goal.goals];
        newGoals[index] = goal;
        this.props.onChange({
            ...this.props.goal,
            goals: newGoals
        });
    }
    
    private deleteGoal(goal: AnyProbabilityGoal) {
        const newGoals = this.props.goal.goals.filter(x => x !== goal);
        this.props.onChange({
            ...this.props.goal,
            goals: newGoals
        });
    }
    
    render() {
        return (
            <div className="full-completion-goal-input-component">
                <Panel
                    title="Full completion"
                    onCloseRequest={() => this.props.onDeleteRequest?.()}
                    backgroundColor="#1F1F23"
                >
                    <SpaceContainer>
                        {this.state.showNoSubgoalsError &&
                        <div>
                            <ErrorDisplay>
                                At least one subgoal must be created.
                            </ErrorDisplay>
                        </div>
                        }
                        {this.props.goal.goals.length > 0 &&
                        <div>
                            {this.props.goal.goals.map((goal, index) => (
                                <GoalInput
                                    key={goal.id}
                                    itemNames={this.props.itemNames}
                                    goal={goal}
                                    onChange={x => this.updateGoal(index, x)}
                                    onDeleteRequest={() => this.deleteGoal(goal)}
                                    validator={this.props.validator}
                                />
                            ))}
                        </div>
                        }
                        <ButtonContainer>
                            <AddGoalButton
                                onNewGoal={goal => this.addGoal(goal)}
                            />
                        </ButtonContainer>
                    </SpaceContainer>
                </Panel>
            </div>
        );
    }
}