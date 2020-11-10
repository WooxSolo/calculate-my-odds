import React from "react";
import { AnyProbabilityGoal, ProbabilityGoal } from "../../shared/interfaces/Goals";
import { ProbabilityItem } from "../../shared/interfaces/Probability";
import { comparisonOperators } from "../helper/ComparatorOperators";
import { nextUniqueId } from "../helper/IdHelpers";
import { Button } from "./common/Button";
import { ProbabilityGoalInput } from "./inputs/ProbabilityGoalInput";

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
    
    private addNewGoal() {
        const newGoal: ProbabilityGoal = {
            type: "PROBABILITY_GOAL",
            id: nextUniqueId().toString(),
            comparator: comparisonOperators.find(x => x.name === ">=")!
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
                <Button
                    content="Add goal"
                    onClick={() => this.addNewGoal()}
                />
            </div>
        );
    }
}