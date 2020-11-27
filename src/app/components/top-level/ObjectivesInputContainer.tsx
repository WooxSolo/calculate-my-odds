import "./ObjectivesInputContainer.scss";
import React from "react";
import { FullCompletionFailure } from "../../../shared/interfaces/Failures";
import { FullCompletionGoal } from "../../../shared/interfaces/Goals";
import { ProbabilityTable } from "../../../shared/interfaces/Probability";
import { Validator } from "../../data-structures/Validator";
import { NameChange } from "../../interfaces/NamingInterfaces";
import { Tabs } from "../common/Tabs";
import { FailureInputContainer } from "./FailureInputContainer";
import { GoalInputContainer } from "./GoalInputContainer";

interface Props {
    tables: ProbabilityTable[],
    onGoalsChange: (rootGoal: FullCompletionGoal) => void,
    onFailuresChange: (rootFailure: FullCompletionFailure) => void,
    validator: Validator
    nameChange?: NameChange
}

interface State {
    selectedIndex: number
}

export class ObjectivesInputContainer extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);
        
        this.state = {
            selectedIndex: 0
        };
    }
    
    render() {
        return (
            <div className="objectives-input-container-component">
                <Tabs
                    selectedIndex={this.state.selectedIndex}
                    onTabSelected={index => this.setState({ selectedIndex: index })}
                    tabs={[
                        {
                            id: "1",
                            name: "Goals",
                            content: (
                                <GoalInputContainer
                                    tables={this.props.tables}
                                    validator={this.props.validator}
                                    nameChange={this.props.nameChange}
                                    onChange={this.props.onGoalsChange}
                                />
                            )
                        },
                        {
                            id: "2",
                            name: "Failures",
                            content: (
                                <FailureInputContainer
                                    tables={this.props.tables}
                                    validator={this.props.validator}
                                    nameChange={this.props.nameChange}
                                    onChange={this.props.onFailuresChange}
                                />
                            )
                        }
                    ]}
                />
            </div>
        );
    }
}