import "./PartialCompletionFailureInput.scss";
import React from "react";
import { AnyProbabilityFailure, PartialCompletionFailure } from "../../../shared/interfaces/Failures";
import { Validator } from "../../data-structures/Validator";
import { ButtonContainer } from "../common/ButtonContainer";
import { EditableInteger } from "../common/EditableInteger";
import { ErrorDisplay } from "../common/ErrorDisplay";
import { Panel } from "../common/Panel";
import { SpaceContainer } from "../common/SpaceContainer";
import { TooltipContainer, TooltipSide } from "../info/TooltipContainer";
import { AddFailureButton } from "./AddFailureButton";
import { FailureInput } from "./FailureInput";

interface Props {
    itemNames: string[],
    failure: PartialCompletionFailure,
    onChange: (failure: PartialCompletionFailure) => void,
    onDeleteRequest?: () => void,
    validator: Validator
}

interface State {
    isMinimumReqValid: boolean,
    showMinimumReqTooltip: boolean,
    minimumReqTooltip?: string,
    showNoSubfailuresError: boolean
}

export class PartialCompletionFailureInput extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);
        
        this.state = {
            isMinimumReqValid: false,
            showMinimumReqTooltip: false,
            showNoSubfailuresError: false
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
        if (this.props.failure.minimumCompletions < 0) {
            this.setState({
                showMinimumReqTooltip: true,
                minimumReqTooltip: "The required amount of completions must be positive."
            });
            return false;
        }
        if (this.props.failure.minimumCompletions > this.props.failure.failures.length) {
            this.setState({
                showMinimumReqTooltip: true,
                minimumReqTooltip: "The required amount of completions is larger than the amount of subfailures."
            });
            return false;
        }
        if (this.props.failure.failures.length === 0) {
            this.setState({
                showNoSubfailuresError: true
            });
            return false;
        }
        return true;
    }
    
    private addFailure(failure: AnyProbabilityFailure) {
        this.props.onChange({
            ...this.props.failure,
            failures: [...this.props.failure.failures, failure]
        });
        this.setState({
            showNoSubfailuresError: false
        });
    }
    
    private updateFailure(index: number, failure: AnyProbabilityFailure) {
        const newFailures = [...this.props.failure.failures];
        newFailures[index] = failure;
        this.props.onChange({
            ...this.props.failure,
            failures: newFailures
        });
    }
    
    private deleteFailure(failure: AnyProbabilityFailure) {
        const newFailures = this.props.failure.failures.filter(x => x !== failure);
        this.props.onChange({
            ...this.props.failure,
            failures: newFailures
        });
    }
    
    render() {
        return (
            <div className="partial-completion-failure-input-component">
                <Panel
                    title="Partial completion"
                    onCloseRequest={() => this.props.onDeleteRequest?.()}
                    backgroundColor="#1F1F23"
                >
                    <SpaceContainer>
                        <div>
                            <span>Minimum required subfailure completions{" "}</span>
                            <TooltipContainer
                                tooltipContent={this.state.minimumReqTooltip}
                                show={this.state.showMinimumReqTooltip}
                                side={TooltipSide.Right}
                                inlineContainer
                            >
                                <EditableInteger
                                    initialValue={this.props.failure.minimumCompletions}
                                    onChange={value => {
                                        this.props.onChange({
                                            ...this.props.failure,
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
                        {this.state.showNoSubfailuresError &&
                        <div>
                            <ErrorDisplay>
                                At least one subfailure must be created.
                            </ErrorDisplay>
                        </div>
                        }
                        {this.props.failure.failures.length > 0 &&
                        <div>
                            {this.props.failure.failures.map((failure, index) => (
                                <FailureInput
                                    key={failure.id}
                                    itemNames={this.props.itemNames}
                                    failure={failure}
                                    onChange={x => this.updateFailure(index, x)}
                                    onDeleteRequest={() => this.deleteFailure(failure)}
                                    validator={this.props.validator}
                                />
                            ))}
                        </div>
                        }
                        <ButtonContainer>
                            <AddFailureButton
                                onNewFailure={failure => this.addFailure(failure)}
                            />
                        </ButtonContainer>
                    </SpaceContainer>
                </Panel>
            </div>
        );
    }
}