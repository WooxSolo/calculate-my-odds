import React from "react";
import { AnyProbabilityFailure, ProbabilityFailureType } from "../../../shared/interfaces/Failures";
import { Validator } from "../../data-structures/Validator";
import { FullCompletionFailureInput } from "./FullCompletionFailureInput";
import { PartialCompletionFailureInput } from "./PartialCompletionFailureInput";
import { SingularCompletionFailureInput } from "./SingularCompletionFailureInput";

interface Props {
    itemNames: string[],
    failure: AnyProbabilityFailure,
    onChange: (failure: AnyProbabilityFailure) => void,
    onDeleteRequest?: () => void,
    validator: Validator
}

interface State {
    
}

export class FailureInput extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);
        
        this.state = {
            
        };
    }
    
    render() {
        switch (this.props.failure.type) {
            case ProbabilityFailureType.SingularCompletionFailure: return (
                <SingularCompletionFailureInput
                    failure={this.props.failure}
                    onChange={this.props.onChange}
                    itemNames={this.props.itemNames}
                    validator={this.props.validator}
                    onDeleteRequest={this.props.onDeleteRequest}
                />
            );
            case ProbabilityFailureType.FullCompletionFailure: return (
                <FullCompletionFailureInput
                    failure={this.props.failure}
                    onChange={this.props.onChange}
                    itemNames={this.props.itemNames}
                    validator={this.props.validator}
                    onDeleteRequest={this.props.onDeleteRequest}
                />
            );
            case ProbabilityFailureType.PartialCompletionFailure: return (
                <PartialCompletionFailureInput
                    failure={this.props.failure}
                    onChange={this.props.onChange}
                    itemNames={this.props.itemNames}
                    validator={this.props.validator}
                    onDeleteRequest={this.props.onDeleteRequest}
                />
            );
        }
        return null;
    }
}