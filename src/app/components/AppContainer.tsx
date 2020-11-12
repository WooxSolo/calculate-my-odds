import "./AppContainer.scss";
import React from "react";
import { AnyProbabilityGoal } from "../../shared/interfaces/Goals";
import { ProbabilityItem } from "../../shared/interfaces/Probability";
import { GoalInputContainer } from "./GoalInputContainer";
import { ProbabilityInputContainer } from "./ProbabilityInputContainer";
import { ResultDisplayContainer } from "./ResultDisplayContainer";

interface Props {
    
}

interface State {
    probabilities: ProbabilityItem[],
    goals: AnyProbabilityGoal[]
}

export class AppContainer extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);
        
        this.state = {
            probabilities: [],
            goals: []
        };
    }
    
    render() {
        return (
            <div className="app-container-component">
                <div className="app-input-container">
                    <div className="app-probability-input-container">
                        <ProbabilityInputContainer
                            onChange={probabilities => this.setState({
                                probabilities: probabilities
                            })}
                        />
                    </div>
                    <div className="app-goal-input-container">
                        <GoalInputContainer
                            probabilities={this.state.probabilities}
                            onChange={goals => this.setState({
                                goals: goals
                            })}
                        />
                    </div>
                </div>
                <div className="app-result-container">
                    <ResultDisplayContainer
                        probabilities={this.state.probabilities}
                        goals={this.state.goals}
                    />
                </div>
            </div>
        );
    }
}