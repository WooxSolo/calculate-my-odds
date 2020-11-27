import "./PartialCompletionGoalInput.scss";
import React from "react";
import { AnyProbabilityGoal, PartialCompletionGoal } from "../../../shared/interfaces/Goals";
import { Validator } from "../../data-structures/Validator";
import { ButtonContainer } from "../common/ButtonContainer";
import { EditableInteger } from "../common/EditableInteger";
import { ErrorDisplay } from "../common/ErrorDisplay";
import { Panel } from "../common/Panel";
import { SpaceContainer } from "../common/SpaceContainer";
import { TooltipContainer, TooltipSide } from "../info/TooltipContainer";
import { AddGoalButton } from "./AddGoalButton";
import { GoalInput } from "./GoalInput";

interface Props {
    itemNames: string[],
    goal: PartialCompletionGoal,
    onChange: (goal: PartialCompletionGoal) => void,
    onDeleteRequest?: () => void,
    validator: Validator
}

interface State {
    isMinimumReqValid: boolean,
    showMinimumReqTooltip: boolean,
    minimumReqTooltip?: string,
    showNoSubgoalsError: boolean
}

export class PartialCompletionGoalInput extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);
        
        this.state = {
            isMinimumReqValid: false,
            showMinimumReqTooltip: false,
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
        if (!this.state.isMinimumReqValid) {
            this.setState({
                showMinimumReqTooltip: true,
                minimumReqTooltip: "A valid integer must be entered."
            });
            return false;
        }
        if (this.props.goal.minimumCompletions < 0) {
            this.setState({
                showMinimumReqTooltip: true,
                minimumReqTooltip: "The required amount of completions must be positive."
            });
            return false;
        }
        if (this.props.goal.minimumCompletions > this.props.goal.goals.length) {
            this.setState({
                showMinimumReqTooltip: true,
                minimumReqTooltip: "The required amount of completions is larger than the amount of subgoals."
            });
            return false;
        }
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
            <div className="partial-completion-goal-input-component">
                <Panel
                    title="Partial completion"
                    onCloseRequest={() => this.props.onDeleteRequest?.()}
                    backgroundColor="#1F1F23"
                >
                    <SpaceContainer>
                        <div>
                            <span>Minimum required subgoal completions{" "}</span>
                            <TooltipContainer
                                tooltipContent={this.state.minimumReqTooltip}
                                show={this.state.showMinimumReqTooltip}
                                side={TooltipSide.Right}
                                inlineContainer
                            >
                                <EditableInteger
                                    initialValue={this.props.goal.minimumCompletions}
                                    onChange={value => {
                                        this.props.onChange({
                                            ...this.props.goal,
                                            minimumCompletions: value
                                        });
                                    }}
                                    onEdited={() => {
                                        this.setState({
                                            showMinimumReqTooltip: false
                                        });
                                    }}
                                    validationCallback={isValid => this.setState({ isMinimumReqValid: isValid })}
                                />
                            </TooltipContainer>
                        </div>
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