import "./AppContainer.scss";
import React from "react";
import { FullCompletionGoal, ProbabilityGoalType } from "../../shared/interfaces/Goals";
import { ProbabilityTable } from "../../shared/interfaces/Probability";
import { ResultDisplayContainer } from "./top-level/ResultDisplayContainer";
import { Validator } from "../data-structures/Validator";
import { nextUniqueId } from "../helper/IdHelpers";
import { FullCompletionFailure, ProbabilityFailureType } from "../../shared/interfaces/Failures";
import { NameChange } from "../interfaces/NamingInterfaces";
import { ObjectivesInputContainer } from "./top-level/ObjectivesInputContainer";
import { ProbabilityInputContainer } from "./top-level/ProbabilityInputContainer";

interface Props {
    
}

interface State {
    tables: ProbabilityTable[],
    rootGoal: FullCompletionGoal,
    rootFailure: FullCompletionFailure,
    lastNameChange?: NameChange,
    validator: Validator
}

export class AppContainer extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);
        
        this.state = {
            tables: [],
            rootGoal: {
                type: ProbabilityGoalType.FullCompletionGoal,
                id: nextUniqueId().toString(),
                goals: []
            },
            rootFailure: {
                type: ProbabilityFailureType.FullCompletionFailure,
                id: nextUniqueId().toString(),
                failures: []
            },
            validator: new Validator()
        };
    }
    
    render() {
        return (
            <div className="app-container-component">
                <div className="app-input-container">
                    <div className="app-probability-input-container">
                        <ProbabilityInputContainer
                            onChange={(tables, nameChange) => this.setState({
                                tables: tables,
                                lastNameChange: nameChange
                            })}
                            validator={this.state.validator}
                        />
                    </div>
                    <div className="app-objectives-input-container">
                        <ObjectivesInputContainer
                            tables={this.state.tables}
                            onGoalsChange={rootGoal => this.setState({
                                rootGoal: rootGoal
                            })}
                            onFailuresChange={rootFailure => this.setState({
                                rootFailure: rootFailure
                            })}
                            validator={this.state.validator}
                            nameChange={this.state.lastNameChange}
                        />
                    </div>
                </div>
                <div className="app-result-container">
                    <ResultDisplayContainer
                        tables={this.state.tables}
                        rootGoal={this.state.rootGoal}
                        rootFailure={this.state.rootFailure}
                        validator={this.state.validator}
                    />
                </div>
            </div>
        );
    }
}