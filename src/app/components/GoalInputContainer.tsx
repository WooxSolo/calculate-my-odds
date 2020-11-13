import "./GoalInputContainer.scss";
import React from "react";
import { ComparisonOperatorType } from "../../shared/interfaces/Compators";
import { AnyProbabilityGoal, ProbabilityGoal } from "../../shared/interfaces/Goals";
import { ProbabilityItem } from "../../shared/interfaces/Probability";
import { comparisonOperators } from "../helper/ComparatorOperators";
import { nextUniqueId } from "../helper/IdHelpers";
import { Button } from "./common/Button";
import { ProbabilityGoalInput } from "./inputs/ProbabilityGoalInput";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { SpaceContainer } from "./common/SpaceContainer";

interface Props {
    probabilities: ProbabilityItem[],
    onChange: (goals: AnyProbabilityGoal[]) => void
}

interface State {
    goals: AnyProbabilityGoal[]
}

export class GoalInputContainer extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);
        
        this.state = {
            goals: []
        };
    }
    
    componentDidUpdate(prevProps: Props) {
        if (this.props.probabilities !== prevProps.probabilities) {
            const itemMap = new Map<string, ProbabilityItem>(
                this.props.probabilities.map(x => [x.id, x]));
            const goals = this.state.goals.filter(x =>
                x.item === undefined || itemMap.has(x.item.id));
            goals.forEach(x => x.item = x.item === undefined ? undefined : itemMap.get(x.item?.id));
            this.setState({
                goals: goals
            });
        }
    }
    
    private addNewGoal() {
        const newGoal: ProbabilityGoal = {
            type: "PROBABILITY_GOAL",
            id: nextUniqueId().toString(),
            comparator: comparisonOperators.find(x => x.type === ComparisonOperatorType.GreaterOrEquals)!,
            targetCount: 1
        };
        const newGoals = [...this.state.goals, newGoal];
        
        this.setState({
            goals: newGoals
        });
        this.props.onChange(newGoals);
    }
    
    private updateGoal(index: number, newGoal: ProbabilityGoal) {
        const newGoals = [...this.state.goals];
        newGoals[index] = newGoal;
        
        this.setState({
            goals: newGoals
        });
        this.props.onChange(newGoals);
    }
    
    private deleteGoal(goal: ProbabilityGoal) {
        const newGoals = this.state.goals.filter(x => x !== goal);
        
        this.setState({
            goals: newGoals
        });
        this.props.onChange(newGoals);
    }
    
    render() {
        return (
            <SpaceContainer className="goal-input-container-component">
                {this.state.goals.length > 0 &&
                <div>
                    {this.state.goals.map((goal, index) => (
                        <div key={goal.id}>
                            <ProbabilityGoalInput
                                probabilityItems={this.props.probabilities}
                                goal={goal}
                                onChange={x => this.updateGoal(index, x)}
                                onDeleteRequest={() => this.deleteGoal(goal)}
                            />
                        </div>
                    ))}
                </div>
                }
                <div>
                    <Button
                        content={<FontAwesomeIcon icon={faPlus} />}
                        onClick={() => this.addNewGoal()}
                    />
                </div>
            </SpaceContainer>
        );
    }
}