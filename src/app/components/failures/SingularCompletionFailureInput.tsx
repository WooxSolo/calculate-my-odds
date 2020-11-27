import './SingularCompletionFailureInput.scss';
import React from 'react';
import { SingularCompletionFailure } from '../../../shared/interfaces/Failures';
import { comparisonOperators } from '../../helper/ComparatorOperators';
import { IntegerInput } from '../common/IntegerInput';
import { Select } from '../common/Select';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { IconContainer } from '../common/IconContainer';
import { Validator } from '../../data-structures/Validator';
import { TooltipContainer, TooltipSide } from '../info/TooltipContainer';

interface Props {
    itemNames: string[],
    failure: SingularCompletionFailure,
    onChange: (failure: SingularCompletionFailure) => void,
    onDeleteRequest?: () => void,
    validator: Validator
}

interface State {
    showNoItemSelectedError: boolean,
    showNoTargetValueError: boolean
}

export class SingularCompletionFailureInput extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {
            showNoItemSelectedError: false,
            showNoTargetValueError: false
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
        if (!this.props.failure.itemName) {
            this.setState({
                showNoItemSelectedError: true
            });
            return false;
        }
        if (this.props.failure.targetCount === undefined) {
            this.setState({
                showNoTargetValueError: true
            });
            return false;
        }
        return true;
    }

    render() {
        return (
            <div className="probability-failure-input-component">
                <div className="failure-probability-item">
                    <TooltipContainer
                        tooltipContent="An option must be selected."
                        show={this.state.showNoItemSelectedError}
                        side={TooltipSide.Left}
                    >
                        <Select
                            options={this.props.itemNames.map(x => ({ name: x }))}
                            value={this.props.failure.itemName ? { name: this.props.failure.itemName } : undefined}
                            onChange={(x) => {
                                this.props.onChange({
                                    ...this.props.failure,
                                    itemName: x?.name,
                                });
                                this.setState({
                                    showNoItemSelectedError: false
                                });
                            }}
                            getOptionLabel={x => x.name}
                            getOptionValue={x => x.name}
                            markError={this.state.showNoItemSelectedError}
                        />
                    </TooltipContainer>
                </div>
                <div className="failure-comparison-operator">
                    <Select
                        options={comparisonOperators}
                        getOptionLabel={(x) => x.type}
                        getOptionValue={(x) => x.type}
                        value={this.props.failure.comparator}
                        onChange={(x) =>
                            this.props.onChange({
                                ...this.props.failure,
                                comparator: x!,
                            })
                        }
                    />
                </div>
                <div className="failure-target-container">
                    <TooltipContainer
                        tooltipContent="A quantity must be entered."
                        show={this.state.showNoTargetValueError}
                        side={TooltipSide.Left}
                    >
                        <IntegerInput
                            placeholder="Quantity"
                            value={this.props.failure.targetCount}
                            onChange={(x) => {
                                this.props.onChange({
                                    ...this.props.failure,
                                    targetCount: x,
                                });
                                this.setState({
                                    showNoTargetValueError: false
                                });
                            }}
                            onFocus={() => this.setState({
                                showNoTargetValueError: false
                            })}
                            markError={this.state.showNoTargetValueError}
                        />
                    </TooltipContainer>
                </div>
                <div className="failure-button-container">
                    <IconContainer
                        icon={faTrash}
                        onClick={this.props.onDeleteRequest}
                    />
                </div>
            </div>
        );
    }
}
