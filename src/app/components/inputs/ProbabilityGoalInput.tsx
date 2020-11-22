import './ProbabilityGoalInput.scss';
import React from 'react';
import { ProbabilityGoal } from '../../../shared/interfaces/Goals';
import { ProbabilityItem } from '../../../shared/interfaces/Probability';
import { comparisonOperators } from '../../helper/ComparatorOperators';
import { IntegerInput } from '../common/IntegerInput';
import { Select } from '../common/Select';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { IconContainer } from '../common/IconContainer';
import { Validator } from '../../data-structures/Validator';
import { TooltipContainer, TooltipSide } from '../info/TooltipContainer';

interface Props {
    probabilityItems: ProbabilityItem[],
    goal: ProbabilityGoal,
    onChange: (goal: ProbabilityGoal) => void,
    onDeleteRequest?: () => void,
    validator: Validator
}

interface State {
    showNoItemSelectedError: boolean,
    showNoTargetValueError: boolean
}

export class ProbabilityGoalInput extends React.PureComponent<Props, State> {
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
        if (!this.props.goal.item) {
            this.setState({
                showNoItemSelectedError: true
            });
            return false;
        }
        if (this.props.goal.targetCount === undefined) {
            this.setState({
                showNoTargetValueError: true
            });
            return false;
        }
        return true;
    }

    render() {
        return (
            <div className="probability-goal-input-component">
                <div className="goal-probability-item">
                    <TooltipContainer
                        tooltipContent="An option must be selected."
                        show={this.state.showNoItemSelectedError}
                        side={TooltipSide.Left}
                    >
                        <Select
                            options={this.props.probabilityItems}
                            value={this.props.goal.item}
                            onChange={(x) => {
                                this.props.onChange({
                                    ...this.props.goal,
                                    item: x,
                                });
                                this.setState({
                                    showNoItemSelectedError: false
                                });
                            }}
                            getOptionLabel={(x) => x.name}
                            getOptionValue={(x) => x.id}
                            markError={this.state.showNoItemSelectedError}
                        />
                    </TooltipContainer>
                </div>
                <div className="goal-comparison-operator">
                    <Select
                        options={comparisonOperators}
                        getOptionLabel={(x) => x.type}
                        getOptionValue={(x) => x.type}
                        value={this.props.goal.comparator}
                        onChange={(x) =>
                            this.props.onChange({
                                ...this.props.goal,
                                comparator: x!,
                            })
                        }
                    />
                </div>
                <div className="goal-target-container">
                    <TooltipContainer
                        tooltipContent="A quantity must be entered."
                        show={this.state.showNoTargetValueError}
                        side={TooltipSide.Left}
                    >
                        <IntegerInput
                            placeholder="Quantity"
                            value={this.props.goal.targetCount}
                            onChange={(x) => {
                                this.props.onChange({
                                    ...this.props.goal,
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
                <div className="goal-button-container">
                    <IconContainer
                        icon={faTrash}
                        onClick={this.props.onDeleteRequest}
                    />
                </div>
            </div>
        );
    }
}
