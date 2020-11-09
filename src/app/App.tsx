import "./App.scss";
import React from "react";
import { ProbabilityInputContainer } from "./components/ProbabilityInputContainer";
import { GoalInputContainer } from "./components/GoalInputContainer";
import { ResultDisplay } from "./components/ResultDisplayInput";
import { ProbabilityItem } from "../shared/interfaces/Probability";
import { AnyProbabilityGoal } from "../shared/interfaces/Goals";

interface Props {
    
}

interface State {
    probabilities: ProbabilityItem[],
    goals: AnyProbabilityGoal[]
}

export class App extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);
        
        this.state = {
            probabilities: [],
            goals: []
        };
    }
    
    render() {
        return (
            <div>
                <ProbabilityInputContainer
                    onChange={probabilities => this.setState({
                        probabilities: probabilities
                    })}
                />
                <GoalInputContainer
                    probabilities={this.state.probabilities}
                    onChange={goals => this.setState({
                        goals: goals
                    })}
                />
                <ResultDisplay
                    probabilities={this.state.probabilities}
                    goals={this.state.goals}
                />
            </div>
        );
    }
}