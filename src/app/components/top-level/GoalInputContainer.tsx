import "./GoalInputContainer.scss";
import React from "react";
import { AnyProbabilityGoal, FullCompletionGoal, ProbabilityGoalType } from "../../../shared/interfaces/Goals";
import { ProbabilityTable } from "../../../shared/interfaces/Probability";
import { nextUniqueId } from "../../helper/IdHelpers";
import { SpaceContainer } from "../common/SpaceContainer";
import { flatten, uniq } from "lodash";
import { Validator } from "../../data-structures/Validator";
import { ErrorDisplay } from "../common/ErrorDisplay";
import { GoalInput } from "../goals/GoalInput";
import { ButtonContainer } from "../common/ButtonContainer";
import { AddGoalButton } from "../goals/AddGoalButton";
import { NameChange } from "../../interfaces/NamingInterfaces";

interface Props {
    tables: ProbabilityTable[],
    onChange: (rootGoal: FullCompletionGoal) => void,
    nameChange?: NameChange,
    validator: Validator
}

interface State {
    rootGoal: FullCompletionGoal,
    showNoGoalsError: boolean
}

function updateGoalFromProbabilityTables(goal: AnyProbabilityGoal, itemNames: Set<string>, nameChange?: NameChange) {
    if (goal.type === ProbabilityGoalType.FullCompletionGoal || goal.type === ProbabilityGoalType.PartialCompletionGoal) {
        for (let i = 0; i < goal.goals.length; i++) {
            if (!updateGoalFromProbabilityTables(goal.goals[i], itemNames, nameChange)) {
                goal.goals.splice(i, 1);
                i--;
            }
        }
    }
    else if (goal.type === ProbabilityGoalType.SingularCompletionGoal) {
        if (goal.itemName !== undefined) {
            if (!itemNames.has(goal.itemName)) {
                if (nameChange && nameChange.oldName === goal.itemName) {
                    goal.itemName = nameChange.newName;
                }
                else {
                    return false;
                }
            }
        }
    }
    else {
        throw new Error();
    }
    
    return true;
}

export class GoalInputContainer extends React.PureComponent<Props, State> {
    private uniqueItemNames: string[] = [];
    
    constructor(props: Props) {
        super(props);
        
        this.state = {
            rootGoal: {
                type: ProbabilityGoalType.FullCompletionGoal,
                id: nextUniqueId().toString(),
                goals: []
            },
            showNoGoalsError: false
        };
        
        this.validate = this.validate.bind(this);
    }
    
    componentDidMount() {
        this.props.validator.addValidation(this.validate);
    }
    
    componentWillUnmount() {
        this.props.validator.removeValidation(this.validate);
    }
    
    componentDidUpdate(prevProps: Props) {
        if (this.props.tables !== prevProps.tables) {
            const items = flatten(this.props.tables.map(x => x.items));
            const newGoals = {...this.state.rootGoal};
            
            this.uniqueItemNames = uniq(items.map(x => x.name));
            this.uniqueItemNames.sort();
            updateGoalFromProbabilityTables(newGoals, new Set(this.uniqueItemNames), this.props.nameChange);
            
            this.setState({
                rootGoal: newGoals
            });
        }
    }
    
    private addGoal(goal: AnyProbabilityGoal) {
        const newGoals = {...this.state.rootGoal};
        newGoals.goals = [...newGoals.goals, goal];
        
        this.setState({
            rootGoal: newGoals,
            showNoGoalsError: false
        });
        this.props.onChange(newGoals);
    }
    
    private updateGoal(index: number, newGoal: AnyProbabilityGoal) {
        const newGoals = {...this.state.rootGoal};
        newGoals.goals[index] = newGoal;
        
        this.setState({
            rootGoal: newGoals
        });
        this.props.onChange(newGoals);
    }
    
    private deleteGoal(goal: AnyProbabilityGoal) {
        const newGoals = {...this.state.rootGoal};
        newGoals.goals = newGoals.goals.filter(x => x !== goal);
        
        this.setState({
            rootGoal: newGoals
        });
        this.props.onChange(newGoals);
    }
    
    private validate() {
        if (this.state.rootGoal.goals.length === 0) {
            this.setState({
                showNoGoalsError: true
            });
            return false;
        }
        return true;
    }
    
    render() {
        return (
            <SpaceContainer className="goal-input-container-component">
                {this.state.showNoGoalsError &&
                <div>
                    <ErrorDisplay>
                        At least one goal must be set.
                    </ErrorDisplay>
                </div>
                }
                {this.state.rootGoal.goals.length > 0 &&
                <div>
                    {this.state.rootGoal.goals.map((goal, index) => (
                        <GoalInput
                            key={goal.id}
                            itemNames={this.uniqueItemNames}
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
        );
    }
}