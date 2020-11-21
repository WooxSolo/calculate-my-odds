import "./ProbabilityInput.scss";
import React from "react";
import { ProbabilityItem } from "../../../shared/interfaces/Probability";
import { parseProbability } from "../../helper/ProbabilityHelper";
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { IconContainer } from "../common/IconContainer";
import { Input } from "../common/Input";
import { Validator } from "../../data-structures/Validator";
import { TooltipContainer, TooltipSide } from "../info/TooltipContainer";

interface Props {
    item: ProbabilityItem,
    onChange: (item: ProbabilityItem) => void,
    onDeleteRequest?: () => void,
    requestTabFocus: () => void,
    showDeleteButton?: boolean,
    validator: Validator
}

interface State {
    showInvalidProbabilityError: boolean,
    isProbabilityInputFocused: boolean
}

export class ProbabilityInput extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);
        
        this.state = {
            showInvalidProbabilityError: false,
            isProbabilityInputFocused: false
        };
        
        this.validate = this.validate.bind(this);
    }
    
    componentDidMount() {
        this.props.validator.addValidation(this.validate);
    }
    
    componentWillUnmount() {
        this.props.validator.removeValidation(this.validate);
    }
    
    private getTooltipErrorContent() {
        if (/^\s*$/.test(this.props.item.probabilityDisplay)) {
            return "A value is required.";
        }
        return (
            <>
                <div>Invalid value. Examples of valid values:</div>
                <div>1/4</div>
                <div>25%</div>
                <div>0.25</div>
            </>
        );
    }
    
    private shouldMarkError() {
        const inputValue = this.props.item.probabilityDisplay;
        if (inputValue === undefined || inputValue.length === 0) {
            return false;
        }
        return parseProbability(inputValue) === undefined;
    }
    
    private validate() {
        if (this.props.item.probability === undefined) {
            this.props.requestTabFocus();
            this.setState({
                showInvalidProbabilityError: true
            });
            return false;
        }
        return true;
    }
    
    render() {
        return (
            <div className="probability-input-component">
                <div className="probability-name">
                    <Input
                        type="text"
                        placeholder="Name"
                        value={this.props.item.name}
                        onChange={e => this.props.onChange({
                            ...this.props.item,
                            name: e.target.value
                        })}
                    />
                </div>
                <div className="probability-chance">
                    <TooltipContainer
                        tooltipContent={this.getTooltipErrorContent()}
                        showOnHover={!this.state.isProbabilityInputFocused && this.shouldMarkError()}
                        show={this.state.showInvalidProbabilityError}
                        side={TooltipSide.Right}
                        maxWidth={"11em"}
                    >
                        <Input
                            type="text"
                            placeholder="Probability"
                            value={this.props.item.probabilityDisplay}
                            onChange={e => {
                                this.props.onChange({
                                    ...this.props.item,
                                    probability: parseProbability(e.target.value),
                                    probabilityDisplay: e.target.value
                                });
                                this.setState({
                                    showInvalidProbabilityError: false
                                });
                            }}
                            markError={this.shouldMarkError()}
                            onlyMarkErrorOnBlur
                            onFocus={() => this.setState({
                                isProbabilityInputFocused: true,
                                showInvalidProbabilityError: false
                            })}
                            onBlur={() => this.setState({
                                isProbabilityInputFocused: false
                            })}
                        />
                    </TooltipContainer>
                </div>
                {this.props.showDeleteButton &&
                <div className="probability-remove">
                    <IconContainer 
                        icon={faTrash}
                        onClick={this.props.onDeleteRequest}
                    />
                </div>
                }
            </div>
        );
    }
}