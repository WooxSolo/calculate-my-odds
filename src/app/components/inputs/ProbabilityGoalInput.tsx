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

interface Props {
    probabilityItems: ProbabilityItem[];
    goal: ProbabilityGoal;
    onChange: (goal: ProbabilityGoal) => void;
    onDeleteRequest?: () => void;
}

interface State {}

export class ProbabilityGoalInput extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);

        this.state = {};
    }

    render() {
        return (
            <div className="probability-goal-input-component">
                <div className="goal-probability-item">
                    <Select
                        options={this.props.probabilityItems}
                        value={this.props.goal.item}
                        onChange={(x) =>
                            this.props.onChange({
                                ...this.props.goal,
                                item: x,
                            })
                        }
                        getOptionLabel={(x) => x.name}
                        getOptionValue={(x) => x.id}
                    />
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
                    <IntegerInput
                        placeholder="Amount"
                        value={this.props.goal.targetCount}
                        onChange={(x) =>
                            this.props.onChange({
                                ...this.props.goal,
                                targetCount: x,
                            })
                        }
                    />
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
