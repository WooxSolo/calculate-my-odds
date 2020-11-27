import "./FullCompletionFailureInput.scss";
import React from "react";
import { AnyProbabilityFailure, FullCompletionFailure } from "../../../shared/interfaces/Failures";
import { Panel } from "../common/Panel";
import { Validator } from "../../data-structures/Validator";
import { ButtonContainer } from "../common/ButtonContainer";
import { AddFailureButton } from "./AddFailureButton";
import { FailureInput } from "./FailureInput";
import { SpaceContainer } from "../common/SpaceContainer";
import { ErrorDisplay } from "../common/ErrorDisplay";

interface Props {
    itemNames: string[],
    failure: FullCompletionFailure,
    onChange: (failure: FullCompletionFailure) => void,
    onDeleteRequest?: () => void,
    validator: Validator
}

interface State {
    showNoSubfailuresError: boolean
}

export class FullCompletionFailureInput extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);
        
        this.state = {
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
            <div className="full-completion-failure-input-component">
                <Panel
                    title="Full completion"
                    onCloseRequest={() => this.props.onDeleteRequest?.()}
                    backgroundColor="#1F1F23"
                >
                    <SpaceContainer>
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