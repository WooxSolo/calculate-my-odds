import { faPlus } from "@fortawesome/free-solid-svg-icons";
import React from "react";
import { ComparisonOperatorType } from "../../../shared/interfaces/Compators";
import { AnyProbabilityFailure, FullCompletionFailure, PartialCompletionFailure, ProbabilityFailureType, SingularCompletionFailure } from "../../../shared/interfaces/Failures";
import { nextUniqueId } from "../../helper/IdHelpers";
import { ButtonWithDropdown } from "../common/ButtonWithDropdown";

interface Props {
    onNewFailure?: (failure: AnyProbabilityFailure) => void
}

interface State {
    
}

export class AddFailureButton extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);
        
        this.state = {
            
        };
    }
    
    private createSingleCompletionFailure() {
        const failure: SingularCompletionFailure = {
            type: ProbabilityFailureType.SingularCompletionFailure,
            id: nextUniqueId().toString(),
            comparator: {
                type: ComparisonOperatorType.GreaterOrEquals
            },
            targetCount: 1
        };
        return failure;
    }
    
    private createFullCompletionFailure() {
        const failure: FullCompletionFailure = {
            type: ProbabilityFailureType.FullCompletionFailure,
            id: nextUniqueId().toString(),
            failures: []
        };
        return failure;
    }
    
    private createPartialCompletionFailure() {
        const failure: PartialCompletionFailure = {
            type: ProbabilityFailureType.PartialCompletionFailure,
            id: nextUniqueId().toString(),
            failures: [],
            minimumCompletions: 1
        };
        return failure;
    }
    
    render() {
        return (
            <div className="add-failure-button-component">
                <ButtonWithDropdown
                    icon={faPlus}
                    content="Add failure condition"
                    onClick={() => this.props.onNewFailure?.(this.createSingleCompletionFailure())}
                    dropdownItems={[
                        {
                            name: "Single completion condition",
                            onClick: () => this.props.onNewFailure?.(this.createSingleCompletionFailure())
                        },
                        {
                            name: "Full completion condition",
                            onClick: () => this.props.onNewFailure?.(this.createFullCompletionFailure())
                        },
                        {
                            name: "Partial completion condition",
                            onClick: () => this.props.onNewFailure?.(this.createPartialCompletionFailure())
                        }
                    ]}
                    dropdownWidth="13em"
                />
            </div>
        );
    }
}