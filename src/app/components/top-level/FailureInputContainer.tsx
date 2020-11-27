import { flatten, uniq } from "lodash";
import React from "react";
import { AnyProbabilityFailure, FullCompletionFailure, ProbabilityFailureType } from "../../../shared/interfaces/Failures";
import { ProbabilityTable } from "../../../shared/interfaces/Probability";
import { Validator } from "../../data-structures/Validator";
import { nextUniqueId } from "../../helper/IdHelpers";
import { NameChange } from "../../interfaces/NamingInterfaces";
import { ButtonContainer } from "../common/ButtonContainer";
import { SpaceContainer } from "../common/SpaceContainer";
import { AddFailureButton } from "../failures/AddFailureButton";
import { FailureInput } from "../failures/FailureInput";

interface Props {
    tables: ProbabilityTable[],
    onChange: (rootFailure: FullCompletionFailure) => void,
    nameChange?: NameChange,
    validator: Validator
}

interface State {
    rootFailure: FullCompletionFailure
}

function updateFailureFromProbabilityTables(failure: AnyProbabilityFailure, itemNames: Set<string>, nameChange?: NameChange) {
    if (failure.type === ProbabilityFailureType.FullCompletionFailure || failure.type === ProbabilityFailureType.PartialCompletionFailure) {
        for (let i = 0; i < failure.failures.length; i++) {
            if (!updateFailureFromProbabilityTables(failure.failures[i], itemNames, nameChange)) {
                failure.failures.splice(i, 1);
                i--;
            }
        }
    }
    else if (failure.type === ProbabilityFailureType.SingularCompletionFailure) {
        if (failure.itemName !== undefined) {
            if (!itemNames.has(failure.itemName)) {
                if (nameChange && nameChange.oldName === failure.itemName) {
                    failure.itemName = nameChange.newName;
                }
                else {
                    return false;
                }
            }
        }
    }
    else {
        throw new Error();
    }
    
    return true;
}

export class FailureInputContainer extends React.PureComponent<Props, State> {
    private uniqueItemNames: string[] = [];
    
    constructor(props: Props) {
        super(props);
        
        this.state = {
            rootFailure: {
                type: ProbabilityFailureType.FullCompletionFailure,
                id: nextUniqueId().toString(),
                failures: []
            }
        };
        
        this.validate = this.validate.bind(this);
    }
    
    componentDidMount() {
        this.props.validator.addValidation(this.validate);
    }
    
    componentWillUnmount() {
        this.props.validator.removeValidation(this.validate);
    }
    
    componentDidUpdate(prevProps: Props) {
        if (this.props.tables !== prevProps.tables) {
            const items = flatten(this.props.tables.map(x => x.items));
            const newFailures = {...this.state.rootFailure};
            
            this.uniqueItemNames = uniq(items.map(x => x.name));
            this.uniqueItemNames.sort();
            updateFailureFromProbabilityTables(newFailures, new Set(this.uniqueItemNames), this.props.nameChange);
            
            this.setState({
                rootFailure: newFailures
            });
        }
    }
    
    private addFailure(failure: AnyProbabilityFailure) {
        const newFailures = {...this.state.rootFailure};
        newFailures.failures = [...newFailures.failures, failure];
        
        this.setState({
            rootFailure: newFailures
        });
        this.props.onChange(newFailures);
    }
    
    private updateFailure(index: number, newFailure: AnyProbabilityFailure) {
        const newFailures = {...this.state.rootFailure};
        newFailures.failures[index] = newFailure;
        
        this.setState({
            rootFailure: newFailures
        });
        this.props.onChange(newFailures);
    }
    
    private deleteFailure(failure: AnyProbabilityFailure) {
        const newFailures = {...this.state.rootFailure};
        newFailures.failures = newFailures.failures.filter(x => x !== failure);
        
        this.setState({
            rootFailure: newFailures
        });
        this.props.onChange(newFailures);
    }
    
    private validate() {
        return true;
    }
    
    render() {
        return (
            <SpaceContainer className="failure-input-container-component">
                {this.state.rootFailure.failures.length > 0 &&
                <div>
                    {this.state.rootFailure.failures.map((failure, index) => (
                        <FailureInput
                            key={failure.id}
                            itemNames={this.uniqueItemNames}
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
        );
    }
}