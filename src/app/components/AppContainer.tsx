import "./AppContainer.scss";
import React from "react";
import { AnyProbabilityGoal } from "../../shared/interfaces/Goals";
import { ProbabilityItem, ProbabilityTable } from "../../shared/interfaces/Probability";
import { GoalInputContainer } from "./GoalInputContainer";
import { ProbabilityInputContainer } from "./ProbabilityInputContainer";
import { ResultDisplayContainer } from "./ResultDisplayContainer";

interface Props {
    
}

interface State {
    tables: ProbabilityTable[],
    goals: AnyProbabilityGoal[]
}

export class AppContainer extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);
        
        this.state = {
            tables: [],
            goals: []
        };
    }
    
    render() {
        return (
            <div className="app-container-component">
                <div className="app-input-container">
                    <div className="app-probability-input-container">
                        <ProbabilityInputContainer
                            onChange={tables => this.setState({
                                tables: tables
                            })}
                        />
                    </div>
                    <div className="app-goal-input-container">
                        <GoalInputContainer
                            tables={this.state.tables}
                            onChange={goals => this.setState({
                                goals: goals
                            })}
                        />
                    </div>
                </div>
                <div className="app-result-container">
                    <ResultDisplayContainer
                        tables={this.state.tables}
                        goals={this.state.goals}
                    />
                </div>
            </div>
        );
    }
}